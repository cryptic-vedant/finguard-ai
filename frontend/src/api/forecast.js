import API from './axios';

export const getForecast = () => API.get('/forecast');