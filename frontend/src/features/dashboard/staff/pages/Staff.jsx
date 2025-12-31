// Halaman Staff: Dashboard Utama
// Menampilkan ringkasan booking dan pesanan yang perlu dikelola
import Drawer from '../../../../components/Drawer';
import kamarIcon from '../../../../assets/door-closed.svg';
import serviceIcon from '../../../../assets/room-service.svg';
import Stat from '../../../../components/Stat';
import { buildStaffMenu } from '../../../../utils/helpers/staffMenu.js';

import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { fetcher } from '../../../../utils/api';

export default function Staff() {
    const navigate = useNavigate();
    
    // Ambil data staff yang login
    const { data: userData, error: userError, isLoading: userLoading } = useSWR('/api/users/auth/me', fetcher);
    
    // Ambil semua bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useSWR('/api/bookings', fetcher);
    
    // Ambil semua orders
    const { data: ordersData, isLoading: ordersLoading } = useSWR('/api/orders/all', fetcher);

    const bookings = bookingsData?.data || [];
    const orders = ordersData?.data || [];

    // Hitung statistik
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const confirmedBookings = bookings.filter(b => b.status === 'dikonfirmasi').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'diproses').length;

    const statsData = [
        {
            title: 'Booking Pending',
            value: pendingBookings.toString(),
            desc: 'Menunggu konfirmasi',
            figure: kamarIcon,
            figureTint: 'text-warning',
            valueTint: 'text-warning',
        },
        {
            title: 'Booking Dikonfirmasi',
            value: confirmedBookings.toString(),
            desc: 'Sedang aktif',
            figure: kamarIcon,
            figureTint: 'text-success',
            valueTint: 'text-success',
        },
        {
            title: 'Pesanan Pending',
            value: pendingOrders.toString(),
            desc: 'Menunggu diproses',
            figure: serviceIcon,
            figureTint: 'text-warning',
            valueTint: 'text-warning',
        },
        {
            title: 'Pesanan Diproses',
            value: processingOrders.toString(),
            desc: 'Sedang dikerjakan',
            figure: serviceIcon,
            figureTint: 'text-info',
            valueTint: 'text-info',
        }
    ];

    if (userLoading || bookingsLoading || ordersLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }
    if (userError) {
        return <div className="flex justify-center items-center h-screen">Error loading data</div>;
    }

    const staffMenu = buildStaffMenu(navigate);
    
    return (
        <div className='bg-base-200 min-h-screen'>
            <Drawer title={`Staff Panel - ${userData?.email || 'Staff'}`} lists={staffMenu}>
                <div className='m-5'>
                    <h2 className='text-2xl font-bold mb-4'>Staff Dashboard</h2>
                    
                    {/* Stats Overview */}
                    <Stat stats={statsData} />
                    
                    {/* Quick Links */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
                        <div 
                            className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                            onClick={() => navigate('/staff/bookings')}
                        >
                            <div className='card-body'>
                                <h3 className='card-title text-primary'>
                                    <img src={kamarIcon} alt="booking" className='w-6 h-6' />
                                    Kelola Booking
                                </h3>
                                <p className='text-sm text-gray-500'>
                                    Konfirmasi dan kelola booking kamar tamu
                                </p>
                                {pendingBookings > 0 && (
                                    <div className='badge badge-warning'>
                                        {pendingBookings} menunggu konfirmasi
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div 
                            className='card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
                            onClick={() => navigate('/staff/orders')}
                        >
                            <div className='card-body'>
                                <h3 className='card-title text-secondary'>
                                    <img src={serviceIcon} alt="orders" className='w-6 h-6' />
                                    Kelola Pesanan Layanan
                                </h3>
                                <p className='text-sm text-gray-500'>
                                    Proses dan selesaikan pesanan layanan
                                </p>
                                {pendingOrders > 0 && (
                                    <div className='badge badge-warning'>
                                        {pendingOrders} menunggu diproses
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
