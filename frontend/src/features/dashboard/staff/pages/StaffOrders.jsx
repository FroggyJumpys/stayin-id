// Halaman Staff: Kelola Pesanan Layanan
// Fitur: Lihat semua pesanan, ubah status (pending, diproses, selesai, dibatalkan)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { buildStaffMenu } from '../../../../utils/helpers/staffMenu.js';
import Drawer from '../../../../components/Drawer';
import Alert from '../../../../components/Alert.jsx';
import { fetcher, api } from '../../../../utils/api';

export default function StaffOrders() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ message: '', status: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Ambil data staff yang login
    const { data: userData, isLoading: userLoading } = useSWR('/api/users/auth/me', fetcher);
    
    // Ambil semua orders dengan detail
    const { data: ordersData, isLoading: ordersLoading } = useSWR('/api/orders/all', fetcher);

    const orders = ordersData?.data || [];

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchSearch = 
            order.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchStatus = filterStatus === 'all' || order.status === filterStatus;
        
        return matchSearch && matchStatus;
    });

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

    // Format Rupiah
    const formatRupiah = (num) => {
        if (!num) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'badge-warning',
            dikonfirmasi: 'badge-info',
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

    // Update status order
    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await api.put('/api/orders/status', {
                id: orderId,
                status: newStatus
            });

            if (response.status === 200) {
                setAlert({ message: response.data.message, status: 200 });
                mutate('/api/orders/all');
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'Gagal mengubah status pesanan.';
            setAlert({ message, status: error?.response?.status || 500 });
        }
    };

    if (userLoading || ordersLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const staffMenu = buildStaffMenu(navigate);

    return (
        <div className='bg-base-200 min-h-screen'>
            {/* Alert */}
            <div className="fixed top-4 right-4 z-50">
                {Alert(alert.message, alert.status)}
            </div>

            <Drawer title={`Kelola Pesanan - ${userData?.email || 'Staff'}`} lists={staffMenu}>
                <div className='m-5'>
                    <div className='card bg-base-100 shadow-sm'>
                        <div className='card-body'>
                            {/* Header dengan Search & Filter */}
                            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4'>
                                <h2 className='card-title'>Daftar Pesanan Layanan</h2>
                                
                                <div className='flex flex-col md:flex-row gap-2 w-full md:w-auto'>
                                    {/* Search */}
                                    <input 
                                        type="search" 
                                        placeholder="Cari nama/email/layanan..." 
                                        className="input input-bordered w-full md:w-64"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    
                                    {/* Filter Status */}
                                    <select 
                                        className="select select-bordered"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="dikonfirmasi">Dikonfirmasi</option>
                                        <option value="dibatalkan">Dibatalkan</option>
                                    </select>
                                </div>
                            </div>

                            <div className='divider my-2'></div>

                            {/* Table */}
                            {filteredOrders.length === 0 ? (
                                <div className='text-center py-10'>
                                    <p className='text-gray-500'>Tidak ada pesanan ditemukan.</p>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Pemesan</th>
                                                <th>Layanan</th>
                                                <th>Qty</th>
                                                <th>Total</th>
                                                <th>Waktu Pesan</th>
                                                <th>Status</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.map((order) => (
                                                <tr key={order.id} className='hover'>
                                                    <td className='font-mono'>#{order.id}</td>
                                                    <td>
                                                        <div>
                                                            <p className='font-semibold'>{order.full_name}</p>
                                                            <p className='text-xs text-gray-500'>{order.email}</p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <p className='font-semibold'>{order.service_name}</p>
                                                            <span className={`badge ${getCategoryBadge(order.category)} badge-sm`}>
                                                                {formatCategory(order.category)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>{order.quantity}</td>
                                                    <td className='font-semibold'>{formatRupiah(order.total_amount)}</td>
                                                    <td className='text-sm'>{formatDate(order.ordered_at)}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className='dropdown dropdown-end'>
                                                            <label tabIndex={0} className='btn btn-sm btn-ghost'>
                                                                Ubah Status ▼
                                                            </label>
                                                            <ul tabIndex={0} className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => updateStatus(order.id, 'pending')}
                                                                        className={order.status === 'pending' ? 'active' : ''}
                                                                    >
                                                                        ⏳ Pending
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => updateStatus(order.id, 'dikonfirmasi')}
                                                                        className={order.status === 'dikonfirmasi' ? 'active' : ''}
                                                                    >
                                                                        ✅ Dikonfirmasi
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => updateStatus(order.id, 'dibatalkan')}
                                                                        className={order.status === 'dibatalkan' ? 'active' : ''}
                                                                    >
                                                                        ❌ Dibatalkan
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
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
