import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import os

# Load data
df = pd.read_csv('data/categorization_data.csv')

# Build pipeline: text -> TF-IDF vectors -> Naive Bayes classifier
model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultinomialNB())
])

# Train
model.fit(df['text'], df['category'])

# Save the trained model
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/categorization_model.pkl')

print("Model trained and saved to models/categorization_model.pkl")