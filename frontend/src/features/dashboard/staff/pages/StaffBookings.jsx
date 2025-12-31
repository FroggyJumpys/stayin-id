// Halaman Staff: Kelola Booking
// Fitur: Lihat semua booking, ubah status (pending, dikonfirmasi, selesai, dibatalkan)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { buildStaffMenu } from '../../../../utils/helpers/staffMenu.js';
import Drawer from '../../../../components/Drawer';
import Alert from '../../../../components/Alert.jsx';
import { fetcher, api } from '../../../../utils/api';

export default function StaffBookings() {
    const navigate = useNavigate();
    const [alert, setAlert] = useState({ message: '', status: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Ambil data staff yang login
    const { data: userData, isLoading: userLoading } = useSWR('/api/users/auth/me', fetcher);
    
    // Ambil semua bookings
    const { data: bookingsData, isLoading: bookingsLoading } = useSWR('/api/bookings', fetcher);

    const bookings = bookingsData?.data || [];

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchSearch = 
            booking.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.room_number?.toString().includes(searchQuery);
        
        const matchStatus = filterStatus === 'all' || booking.status === filterStatus;
        
        return matchSearch && matchStatus;
    });

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
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

    // Update status booking
    const updateStatus = async (bookingId, newStatus) => {
        try {
            const response = await api.put('/api/bookings/status', {
                id: bookingId,
                status: newStatus
            });

            if (response.status === 200) {
                setAlert({ message: response.data.message, status: 200 });
                mutate('/api/bookings');
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'Gagal mengubah status booking.';
            setAlert({ message, status: error?.response?.status || 500 });
        }
    };

    if (userLoading || bookingsLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const staffMenu = buildStaffMenu(navigate);

    return (
        <div className='bg-base-200 min-h-screen'>
            {/* Alert */}
            <div className="fixed top-4 right-4 z-50">
                {Alert(alert.message, alert.status)}
            </div>

            <Drawer title={`Kelola Booking - ${userData?.email || 'Staff'}`} lists={staffMenu}>
                <div className='m-5'>
                    <div className='card bg-base-100 shadow-sm'>
                        <div className='card-body'>
                            {/* Header dengan Search & Filter */}
                            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4'>
                                <h2 className='card-title'>Daftar Booking</h2>
                                
                                <div className='flex flex-col md:flex-row gap-2 w-full md:w-auto'>
                                    {/* Search */}
                                    <input 
                                        type="search" 
                                        placeholder="Cari nama/email/kamar..." 
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
                            {filteredBookings.length === 0 ? (
                                <div className='text-center py-10'>
                                    <p className='text-gray-500'>Tidak ada booking ditemukan.</p>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Tamu</th>
                                                <th>Kamar</th>
                                                <th>Check In</th>
                                                <th>Check Out</th>
                                                <th>Status</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBookings.map((booking) => (
                                                <tr key={booking.id} className='hover'>
                                                    <td className='font-mono'>#{booking.id}</td>
                                                    <td>
                                                        <div>
                                                            <p className='font-semibold'>{booking.full_name}</p>
                                                            <p className='text-xs text-gray-500'>{booking.email}</p>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <p className='font-semibold'>{booking.room_number}</p>
                                                            <p className='text-xs text-gray-500'>{booking.room_type}</p>
                                                        </div>
                                                    </td>
                                                    <td>{formatDate(booking.check_in)}</td>
                                                    <td>{formatDate(booking.check_out)}</td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadge(booking.status)}`}>
                                                            {booking.status}
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
                                                                        onClick={() => updateStatus(booking.id, 'pending')}
                                                                        className={booking.status === 'pending' ? 'active' : ''}
                                                                    >
                                                                        ⏳ Pending
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => updateStatus(booking.id, 'dikonfirmasi')}
                                                                        className={booking.status === 'dikonfirmasi' ? 'active' : ''}
                                                                    >
                                                                        ✅ Dikonfirmasi
                                                                    </button>
                                                                </li>
                                                                <li>
                                                                    <button 
                                                                        onClick={() => updateStatus(booking.id, 'dibatalkan')}
                                                                        className={booking.status === 'dibatalkan' ? 'active' : ''}
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
