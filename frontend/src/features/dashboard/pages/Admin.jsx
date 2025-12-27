// Dashboard Admin (Home): ringkasan statistik & data terbaru
import Drawer from '../../../components/Drawer';
import userIcon from '../../../assets/user.svg';
import starIcon from '../../../assets/star.svg';
import kamarIcon from '../../../assets/door-closed.svg';
import serviceIcon from '../../../assets/room-service.svg';
import { buildAdminMenu } from '../../../utils/helpers/adminMenu';
import Stat from '../../../components/Stat';

import { GetStat } from '../../../helpers/GetStat.js';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const navigate = useNavigate();
    // Langsung destructure data dari SWR
    const { data: userData } = GetStat(`${import.meta.env.VITE_API_URL}/api/users`);
    const { data: userGrowth } = GetStat(`${import.meta.env.VITE_API_URL}/api/users/admin/growth`);
    const { data: kamarData } = GetStat(`${import.meta.env.VITE_API_URL}/api/rooms`);
    const { data: serviceData } = GetStat(`${import.meta.env.VITE_API_URL}/api/services`);
    const { data: reviewsData } = GetStat(`${import.meta.env.VITE_API_URL}/api/reviews`);

    // Recent data
    const { data: recentUser } = GetStat(`${import.meta.env.VITE_API_URL}/api/users/data/recent`);
    const { data: recentReview } = GetStat(`${import.meta.env.VITE_API_URL}/api/reviews/data/recent`);

    const statsData = [
        {
            title: 'Total User',
            value: userData?.length || 0, // Optional chaining + fallback
            desc: `${userGrowth?.growth_percentage || 0}% dari bulan lalu.`,
            figure: userIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Kamar',
            value: kamarData?.length || 0,
            desc: '',
            figure: kamarIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Service',
            value: serviceData?.length || 0,
            desc: '',
            figure: serviceIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Review',
            value: reviewsData?.data?.length || 0, // Akses nested dengan safe
            desc: '',
            figure: starIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        }
    ];

    const statRecent = [
        {
            title: 'Recent User',
            value: recentUser?.data?.email || 'Tidak ada user terbaru',
            desc: recentUser?.data?.created_at 
                ? `Terdaftar: ${new Date(recentUser.data.created_at).toLocaleDateString()}`
                : '',
            figure: userIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Recent Review',
            value: recentReview?.data?.comment || 'Tidak ada review terbaru',
            desc: recentReview?.data?.rating 
                ? `${recentReview.data.rating} ⭐ | ${recentReview.data.full_name} - ${new Date(recentReview.data.created_at).toLocaleDateString()}`
                : '',
            figure: starIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        }
    ];

    // Menu Admin via helper agar konsisten di semua halaman
    const menuItems = buildAdminMenu(navigate);

    return (
        <>
            <div className='bg-base-200 min-h-screen'>
                <Drawer title='Home' lists={menuItems}>
                    <div className='m-5'>
                        <div className='my-2 text-2xl font-bold'>
                            <span className='divider bg-white rounded-2xl px-1 py-3'>INFO</span>
                        </div>
                        <Stat stats={statsData} />
                        <div className='my-2 text-2xl font-bold'>
                            <span className='divider bg-white rounded-2xl px-1 py-3'>RECENTS</span>
                        </div>
                        <Stat stats={statRecent} />
                    </div>
                </Drawer>
            </div>
        </>
    );
}