// Halaman User: Daftar Review/Rating
// Fitur: Menampilkan semua review user dan rata-rata rating
import { useNavigate } from 'react-router-dom';
import { buildUserMenu } from '../../../../utils/helpers/userMenu.js';
import Drawer from '../../../../components/Drawer';
import Stat from '../../../../components/Stat.jsx';
import { GetStat } from '../../../../helpers/GetStat.js';

// Icons
import starIcon from '../../../../assets/star.svg';

export default function UserRatings() {
    const navigate = useNavigate();

    // 1) Ambil data user yang login
    const { data: userData, isLoading: userLoading } = GetStat('/api/users/auth/me');
    
    // 2) Ambil reviews milik user
    const { data: reviewsData, isLoading: reviewsLoading } = GetStat(
        userData?.id ? `/api/reviews/${userData.id}` : null
    );

    // Loading state
    if (userLoading || reviewsLoading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    const reviews = reviewsData?.data || [];
    
    // Hitung rata-rata rating
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Render stars
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span 
                    key={i} 
                    className={`text-xl ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    // Stats data
    const statsData = [
        {
            title: 'Total Review',
            value: reviews.length.toString(),
            desc: 'Review yang pernah dibuat',
            figure: starIcon,
            figureTint: 'text-primary',
            valueTint: 'text-primary',
        },
        {
            title: 'Rata-rata Rating',
            value: avgRating.toString(),
            desc: 'Dari semua review',
            figure: (
                <span className='text-2xl text-yellow-400'>★</span>
            ),
            valueTint: 'text-yellow-500',
        }
    ];

    const userMenu = buildUserMenu(navigate);

    return (
        <div className='bg-base-200 min-h-screen'>
            <Drawer title={`Review Saya - ${userData?.email || 'User'}`} lists={userMenu}>
                <div className='m-5'>
                    {/* Stats Section */}
                    <Stat stats={statsData} />

                    {/* Reviews List */}
                    <div className='card bg-base-100 shadow-sm mt-6'>
                        <div className='card-body'>
                            <h2 className='card-title'>Daftar Review</h2>
                            <div className='divider'></div>
                            
                            {reviews.length === 0 ? (
                                <div className='text-center py-10'>
                                    <p className='text-gray-500'>Belum ada review.</p>
                                    <p className='text-sm text-gray-400 mt-2'>
                                        Buat review setelah menyelesaikan booking Anda.
                                    </p>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {reviews.map((review) => (
                                        <div 
                                            key={review.id} 
                                            className='card bg-base-100 shadow-sm'
                                        >
                                            <div className='card-body'>
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <div className='flex items-center gap-2 mb-2'>
                                                            {renderStars(review.rating)}
                                                            <span className='font-bold text-lg'>
                                                                {review.rating}/5
                                                            </span>
                                                        </div>
                                                        {review.booking_id && (
                                                            <p className='text-sm text-gray-500 mb-2'>
                                                                Booking #{review.booking_id}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className='text-right text-sm text-gray-500'>
                                                        <p>{formatDate(review.created_at)}</p>
                                                        {review.updated_at !== review.created_at && (
                                                            <p className='text-xs'>
                                                                (diperbarui: {formatDate(review.updated_at)})
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='divider my-1'></div>
                                                <p className='text-base'>{review.comment}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
}
