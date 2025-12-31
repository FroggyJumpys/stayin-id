// Halaman User: Daftar Service Orders
// Fitur: Menampilkan semua pesanan layanan user dengan total pengeluaran
import { useNavigate } from 'react-router-dom';
import { buildUserMenu } from '../../../../utils/helpers/userMenu.js';
import Drawer from '../../../../components/Drawer';
import Stat from '../../../../components/Stat.jsx';
import { GetStat } from '../../../../helpers/GetStat.js';

// Icons
import serviceIcon from '../../../../assets/room-service.svg';
import chartIcon from '../../../../assets/chart.svg';

export default function UserOrders() {
    const navigate = useNavigate();

    // 1) Ambil data user yang login
    const { data: userData, isLoading: userLoading } = GetStat('/api/users/auth/me');
    
    // 2) Ambil orders milik user
    const { data: ordersData, isLoading: ordersLoading } = GetStat(
        userData?.id ? `/api/orders/user/${userData.id}` : null
    );

    // Loading state
    if (userLoading || ordersLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const orders = ordersData?.data || [];
    const totalAmount = ordersData?.total_amount || 0;

    // Format Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'badge-warning',
            dikonfirmasi: 'badge-success',
            dibatalkan: 'badge-error'
        };
        return styles[status] || 'badge-ghost';
    };

    // Category badge styling
    const getCategoryBadge = (category) => {
        const styles = {
            'food_and_drink': 'badge-accent',
            'laundry': 'badge-secondary',
            'transport': 'badge-primary',
            'other': 'badge-ghost'
        };
        return styles[category] || 'badge-ghost';
    };

    const formatCategory = (cat) => {
        const labels = {
            'food_and_drink': 'F&B',
            'laundry': 'Laundry',
            'transport': 'Transport',
            'other': 'Lainnya'
        };
        return labels[cat] || cat;
    };

    // Stats data
    const statsData = [
        {
            title: 'Total Pesanan',
            value: orders.length.toString(),
            desc: 'Layanan yang pernah dipesan',
            figure: serviceIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Pengeluaran',
            value: formatRupiah(totalAmount),
            desc: 'Dari semua pesanan layanan',
            figure: chartIcon,
            figureTint: 'text-success',
            valueTint: 'text-success',
        }
    ];

    const userMenu = buildUserMenu(navigate);

    return (
        <div className='bg-base-200 min-h-screen'>
            <Drawer title={`Pesanan Layanan - ${userData?.email || 'User'}`} lists={userMenu}>
                <div className='m-5'>
                    {/* Stats Section */}
                    <Stat stats={statsData} />

                    {/* Table Section */}
                    <div className='card bg-base-100 shadow-sm mt-6'>
                        <div className='card-body'>
                            <h2 className='card-title'>Daftar Pesanan Layanan</h2>
                            <div className='divider'></div>
                            
                            {orders.length === 0 ? (
                                <div className='text-center py-10'>
                                    <p className='text-gray-500'>Belum ada pesanan layanan.</p>
                                    <button 
                                        className='btn btn-primary mt-4'
                                        onClick={() => navigate('/service')}
                                    >
                                        Pesan Layanan
                                    </button>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Layanan</th>
                                                <th>Kategori</th>
                                                <th>Qty</th>
                                                <th>Harga</th>
                                                <th>Total</th>
                                                <th>Waktu Pesan</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order, idx) => (
                                                <tr key={order.id} className='hover'>
                                                    <td>{idx + 1}</td>
                                                    <td className='font-semibold'>{order.service_name}</td>
                                                    <td>
                                                        <span className={`badge ${getCategoryBadge(order.category)} badge-sm`}>
                                                            {formatCategory(order.category)}
                                                        </span>
                                                    </td>
                                                    <td>{order.quantity}</td>
                                                    <td>{formatRupiah(order.service_price)}</td>
                                                    <td className='font-semibold'>{formatRupiah(order.total_amount)}</td>
                                                    <td className='text-sm'>{formatDate(order.ordered_at)}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
