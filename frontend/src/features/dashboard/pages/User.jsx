import Drawer from '../../../components/Drawer';
import kamarIcon from '../../../assets/door-closed.svg'
import serviceIcon from '../../../assets/room-service.svg';
import starIcon from '../../../assets/star.svg';
import chartIcon from '../../../assets/chart.svg';
import Stat from '../../../components/Stat';
import { buildUserMenu } from '../../../utils/helpers/userMenu.js';

import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { fetcher } from '../../../utils/api';

export default function User() {
    const navigate = useNavigate();
    
    // Ambil data user yang login
    const { data: userData, error: userError, isLoading: userLoading } = useSWR('/api/users/auth/me', fetcher);
    
    // Ambil data lengkap user (statistik) setelah userId tersedia
    const { data: userStats, isLoading: statsLoading } = useSWR(
        userData?.id ? `/api/users/data/${userData.id}` : null,
        fetcher
    );

    // Format Rupiah
    const formatRupiah = (num) => {
        if (!num) return 'Rp 0';
        if (num >= 1000000) {
            return `Rp ${(num / 1000000).toFixed(1)}M`;
        } else if (num >= 1000) {
            return `Rp ${(num / 1000).toFixed(0)}K`;
        }
        return `Rp ${num}`;
    };

    // Data statistik dari API atau default 0
    const summary = userStats?.summary || {};
    
    const statsData = [
        {
            title: 'Total Booking',
            value: summary.total_bookings?.toString() || '0',
            desc: 'Booking dikonfirmasi',
            figure: kamarIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Order Service',
            value: summary.total_orders?.toString() || '0',
            desc: 'Pesanan selesai',
            figure: serviceIcon,
            figureTint: 'text-secondary',
            valueTint: 'text-secondary',
        },
        {
            title: 'Total Review',
            value: summary.total_reviews?.toString() || '0',
            desc: `Rating: ${summary.avg_rating || 0} ★`,
            figure: starIcon,
            figureTint: 'text-warning',
            valueTint: 'text-warning',
        },
        {
            title: 'Total Pengeluaran',
            value: formatRupiah((summary.total_payment || 0) + (summary.total_order_amount || 0)),
            desc: 'Booking + Service',
            figure: chartIcon,
            figureTint: 'text-success',
            valueTint: 'text-success',
        }
    ];

    if (userLoading || statsLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (userError) return <div className="flex justify-center items-center h-screen">Error loading data</div>;

    const userMenu = buildUserMenu(navigate);
    
    return (
        <>
            <div className='bg-base-200 min-h-screen'>
                <Drawer title={`Welcome, ${userData?.email || 'User'}`} lists={userMenu}>
                    <div className='m-5'>
                        <h2 className='text-2xl font-bold mb-4'>User Dashboard</h2>
                        
                        {/* Stats Overview */}
                        <Stat stats={statsData} />
                        
                        {/* Quick Links */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
                            <div 
                                className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                                onClick={() => navigate('/user/bookings')}
                            >
                                <div className='card-body'>
                                    <h3 className='card-title text-primary'>
                                        <img src={kamarIcon} alt="booking" className='w-6 h-6' />
                                        Booking Saya
                                    </h3>
                                    <p className='text-sm text-gray-500'>Lihat riwayat booking kamar</p>
                                </div>
                            </div>
                            
                            <div 
                                className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                                onClick={() => navigate('/user/orders')}
                            >
                                <div className='card-body'>
                                    <h3 className='card-title text-secondary'>
                                        <img src={serviceIcon} alt="orders" className='w-6 h-6' />
                                        Pesanan Layanan
                                    </h3>
                                    <p className='text-sm text-gray-500'>Lihat pesanan service hotel</p>
                                </div>
                            </div>
                            
                            <div 
                                className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                                onClick={() => navigate('/user/ratings')}
                            >
                                <div className='card-body'>
                                    <h3 className='card-title text-warning'>
                                        <img src={starIcon} alt="ratings" className='w-6 h-6' />
                                        Review Saya
                                    </h3>
                                    <p className='text-sm text-gray-500'>Lihat dan kelola review Anda</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        </>
    )
}
