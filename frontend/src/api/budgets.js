import API from './axios';

export const getBudgets = (month, year) => API.get(`/budgets?month=${month}&year=${year}`);
export const setBudget = (data) => API.post('/budgets', data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`);