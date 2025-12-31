import useSWR from 'swr';
import { fetcher } from '../../../utils/api.js';


// Hook auth sederhana untuk mengambil profil user yang login
export function Auth () {
    const { data, error, isLoading } = useSWR(`${import.meta.env.VITE_API_URL}/api/users/auth/me`, fetcher);

    return {
        user: data,
        isLoading,
        isError: error
    };
};