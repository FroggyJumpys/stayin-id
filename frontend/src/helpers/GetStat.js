import useSWR from 'swr';
import { fetcher } from '../utils/api.js';

// Hook kecil untuk ambil data via SWR
// Terima path relatif seperti `/api/users` agar konsisten
export function GetStat(url) {
    const { data, error, isLoading } = useSWR(url, fetcher);

    return {
        data,
        isLoading,
        isError: error
    };
}