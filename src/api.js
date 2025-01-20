import axios from 'axios';

const api = axios.create({
    baseURL: 'http://34.22.98.26:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;