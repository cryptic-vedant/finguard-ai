import API from './axios';

export const getInsights = () => API.get('/insights');