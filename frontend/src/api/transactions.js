import API from './axios';

export const getTransactions = () => API.get('/transactions');
export const createTransaction = (data) => API.post('/transactions', data);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);

export const downloadCSV = async () => {
  const response = await API.get('/transactions/export/csv', {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'finguard-transactions.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadPDF = async () => {
  const response = await API.get('/transactions/export/pdf', {
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'finguard-report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
};