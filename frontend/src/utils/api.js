// Axios instance & SWR fetcher untuk seluruh frontend
// - baseURL: diambil dari VITE_API_URL
// - withCredentials: true untuk mengirim cookie/session
import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Fetcher standar untuk SWR
export const fetcher = (url) => api.get(url).then((res) => res.data);

export default api;
