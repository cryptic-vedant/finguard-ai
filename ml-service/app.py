from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

categorization_model = joblib.load('models/categorization_model.pkl')

@app.route('/')
def home():
    return jsonify({"message": "FinGuard AI ML service is running"})

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/predict-category', methods=['POST'])
def predict_category():
    data = request.get_json()
    text = f"{data.get('merchant', '')} {data.get('description', '')}".strip()

    if not text:
        return jsonify({"category": "Others"})

    prediction = categorization_model.predict([text])[0]
    return jsonify({"category": prediction})


@app.route('/detect-fraud', methods=['POST'])
def detect_fraud():
    data = request.get_json()
    past_transactions = data.get('transactions', [])
    new_transaction = data.get('new_transaction')

    if not new_transaction:
        return jsonify({"error": "new_transaction is required"}), 400

    MIN_HISTORY = 10
    if len(past_transactions) < MIN_HISTORY:
        return jsonify({
            "is_anomaly": False,
            "risk_level": "Unknown",
            "reason": f"Not enough transaction history yet ({len(past_transactions)}/{MIN_HISTORY}) to assess risk"
        })

    df = pd.DataFrame(past_transactions)
    df = df[['amount', 'hour']].fillna(0)

    new_amount = new_transaction.get('amount', 0)
    new_hour = new_transaction.get('hour', 12)

    mean_amount = df['amount'].mean()
    std_amount = df['amount'].std() or 1
    amount_zscore = (new_amount - mean_amount) / std_amount

    scaler = StandardScaler()
    scaled_df = scaler.fit_transform(df)

    model = IsolationForest(contamination=0.1, random_state=42, n_estimators=200)
    model.fit(scaled_df)

    train_scores = model.score_samples(scaled_df)
    threshold = train_scores.mean() - 1.5 * train_scores.std()

    new_scaled = scaler.transform([[new_amount, new_hour]])
    ml_score = model.score_samples(new_scaled)[0]
    ml_flags_anomaly = ml_score < threshold

    if abs(amount_zscore) > 3:
        is_anomaly = True
        risk_level = "High"
        reason = "Transaction amount is far outside your typical spending range"
    elif ml_flags_anomaly:
        is_anomaly = True
        risk_level = "Medium"
        reason = "Transaction amount/timing differs from your usual pattern"
    else:
        is_anomaly = False
        risk_level = "Low"
        reason = "Transaction looks consistent with your normal spending"

    return jsonify({
        "is_anomaly": bool(is_anomaly),
        "risk_level": risk_level,
        "amount_zscore": round(float(amount_zscore), 2),
        "ml_anomaly_score": round(float(ml_score), 4),
        "reason": reason
    })


@app.route('/forecast-expense', methods=['POST'])
def forecast_expense():
    data = request.get_json()
    transactions = data.get('transactions', [])

    MIN_HISTORY = 14
    if len(transactions) < MIN_HISTORY:
        return jsonify({
            "forecast_available": False,
            "reason": f"Not enough transaction history yet ({len(transactions)}/{MIN_HISTORY}) to forecast"
        })

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')

    daily = df.groupby(df['date'].dt.date)['amount'].sum().reset_index()
    daily.columns = ['date', 'amount']

    daily['day_number'] = (pd.to_datetime(daily['date']) - pd.to_datetime(daily['date']).min()).dt.days

    X = daily[['day_number']].values
    y = daily['amount'].values

    model = LinearRegression()
    model.fit(X, y)

    last_day = daily['day_number'].max()
    future_days = np.array([[last_day + i] for i in range(1, 31)])
    predictions = model.predict(future_days)
    predictions = np.maximum(predictions, 0)

    predicted_next_month_total = round(float(predictions.sum()), 2)
    avg_daily_predicted = round(float(predictions.mean()), 2)

    return jsonify({
        "forecast_available": True,
        "predicted_next_month_total": predicted_next_month_total,
        "avg_daily_predicted": avg_daily_predicted,
        "forecast_days": 30
    })

@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    """
    Expects:
    {
      "transactions": [ { "amount": 200, "category": "Food", "merchant": "Zomato", "date": "2026-07-01" }, ... ]
    }
    """
    data = request.get_json()
    transactions = data.get('transactions', [])

    if len(transactions) < 5:
        return jsonify({
            "insights": [],
            "subscriptions": [],
            "reason": "Not enough transaction history yet for insights"
        })

    df = pd.DataFrame(transactions)
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.to_period('M')

    insights = []

    # 1. Category spending comparison: this month vs last month
    months = sorted(df['month'].unique())
    if len(months) >= 2:
        current_month = months[-1]
        previous_month = months[-2]

        current_by_cat = df[df['month'] == current_month].groupby('category')['amount'].sum()
        previous_by_cat = df[df['month'] == previous_month].groupby('category')['amount'].sum()

        for category in current_by_cat.index:
            current_amt = current_by_cat.get(category, 0)
            previous_amt = previous_by_cat.get(category, 0)

            if previous_amt > 0:
                pct_change = ((current_amt - previous_amt) / previous_amt) * 100
                if pct_change > 20:
                    insights.append(
                        f"Your {category} spending increased by {round(pct_change)}% compared to last month"
                    )
                elif pct_change < -20:
                    insights.append(
                        f"Great job! Your {category} spending decreased by {round(abs(pct_change))}% compared to last month"
                    )

    # 2. Top spending category overall
    top_category = df.groupby('category')['amount'].sum().idxmax()
    top_amount = df.groupby('category')['amount'].sum().max()
    insights.append(f"Your highest spending category is {top_category} (₹{round(top_amount)} total)")

    # 3. Average transaction size
    avg_transaction = df['amount'].mean()
    insights.append(f"Your average transaction amount is ₹{round(avg_transaction)}")

    # --- Subscription detection ---
    # Look for merchants that appear multiple times with very similar amounts (recurring pattern)
    subscriptions = []
    if 'merchant' in df.columns:
        merchant_groups = df[df['merchant'].str.strip() != ''].groupby('merchant')

        for merchant, group in merchant_groups:
            if len(group) >= 2:
                amounts = group['amount'].values
                amount_std = amounts.std()
                amount_mean = amounts.mean()

                # Low variation in amount + multiple occurrences = likely subscription
                if amount_mean > 0 and (amount_std / amount_mean) < 0.1:
                    subscriptions.append({
                        "merchant": merchant,
                        "amount": round(float(amount_mean), 2),
                        "occurrences": len(group)
                    })

    return jsonify({
        "insights": insights,
        "subscriptions": subscriptions
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5001)), debug=True)