import Drawer from '../../../components/Drawer';
import userIcon from '../../../assets/user.svg';
import kamarIcon from '../../../assets/door-closed.svg'
import serviceIcon from '../../../assets/room-service.svg';
import Stat from '../../../components/Stat';
import { buildUserMenu } from '../../../utils/helpers/userMenu.js';

import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { fetcher } from '../../../utils/api';

export default function User() {
    const navigate = useNavigate();
    // Pakai path relatif + fetcher bersama
    const { data, error, isLoading } = useSWR('/api/users/auth/me', fetcher);

    const statsData = [
        {
            title: 'Total Booking',
            value: '5',
            desc: '',
            figure: kamarIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Order Service',
            value: '5',
            desc: '',
            figure: serviceIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Pengeluaran',
            value: 'Rp 2.5M',
            desc: '',
            figure: userIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        }
    ];

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading data</div>;


    const userMenu = buildUserMenu(navigate)
    return (
        <>
            <div className='bg-base-200'>
                <Drawer title={`Welcome, ${data?.email || 'User'}`} lists={userMenu}>
                    <div className='m-5'>
                        <h2 className='text-2xl font-bold mb-4'>User Dashboard</h2>
                        <Stat stats={statsData} />
                    </div>
                </Drawer>
            </div>
        </>
    )
}
