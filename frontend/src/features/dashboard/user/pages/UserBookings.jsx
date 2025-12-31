// Halaman User: Daftar Booking
// Fitur: Menampilkan semua booking user dengan total pembayaran
import { useNavigate } from 'react-router-dom';
import { buildUserMenu } from '../../../../utils/helpers/userMenu.js';
import Drawer from '../../../../components/Drawer';
import Stat from '../../../../components/Stat.jsx';
import { GetStat } from '../../../../helpers/GetStat.js';

// Icons
import kamarIcon from '../../../../assets/door-closed.svg';
import chartIcon from '../../../../assets/chart.svg';

export default function UserBookings() {
    const navigate = useNavigate();

    // 1) Ambil data user yang login
    const { data: userData, isLoading: userLoading } = GetStat('/api/users/auth/me');
    
    // 2) Ambil bookings milik user
    const { data: bookingsData, isLoading: bookingsLoading } = GetStat(
        userData?.id ? `/api/bookings/user/${userData.id}` : null
    );

    // Loading state
    if (userLoading || bookingsLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const bookings = bookingsData?.data || [];
    
    // Hitung total payment dari semua booking
    const totalPayment = bookings.reduce((sum, booking) => {
        // Hitung jumlah hari
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return sum + (booking.price * days);
    }, 0);

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
            selesai: 'badge-info',
            dibatalkan: 'badge-error'
        };
        return styles[status] || 'badge-ghost';
    };

    // Stats data
    const statsData = [
        {
            title: 'Total Booking',
            value: bookings.length.toString(),
            desc: 'Booking yang pernah dibuat',
            figure: kamarIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Total Pembayaran',
            value: formatRupiah(totalPayment),
            desc: 'Dari semua booking',
            figure: chartIcon,
            figureTint: 'text-success',
            valueTint: 'text-success',
        }
    ];

    const userMenu = buildUserMenu(navigate);

    return (
        <div className='bg-base-200 min-h-screen'>
            <Drawer title={`Booking - ${userData?.email || 'User'}`} lists={userMenu}>
                <div className='m-5'>
                    {/* Stats Section */}
                    <Stat stats={statsData} />

                    {/* Table Section */}
                    <div className='card bg-base-100 shadow-sm mt-6'>
                        <div className='card-body'>
                            <h2 className='card-title'>Daftar Booking</h2>
                            <div className='divider'></div>
                            
                            {bookings.length === 0 ? (
                                <div className='text-center py-10'>
                                    <p className='text-gray-500'>Belum ada booking.</p>
                                    <button 
                                        className='btn btn-primary mt-4'
                                        onClick={() => navigate('/rooms')}
                                    >
                                        Booking Sekarang
                                    </button>
                                </div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Kamar</th>
                                                <th>Tipe</th>
                                                <th>Check In</th>
                                                <th>Check Out</th>
                                                <th>Harga/Malam</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking, idx) => {
                                                const checkIn = new Date(booking.check_in);
                                                const checkOut = new Date(booking.check_out);
                                                const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                                                const total = booking.price * days;

                                                return (
                                                    <tr key={booking.id} className='hover'>
                                                        <td>{idx + 1}</td>
                                                        <td className='font-semibold'>{booking.room_number}</td>
                                                        <td>{booking.room_type}</td>
                                                        <td>{formatDate(booking.check_in)}</td>
                                                        <td>{formatDate(booking.check_out)}</td>
                                                        <td>{formatRupiah(booking.price)}</td>
                                                        <td className='font-semibold'>{formatRupiah(total)}</td>
                                                        <td>
                                                            <span className={`badge ${getStatusBadge(booking.status)}`}>
                                                                {booking.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
