// Komponen ReviewSection untuk Homepage
// Menampilkan 5 review terbaru dan form tambah review (login required)
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useSWR, { mutate } from 'swr';
import { fetcher, api } from '../../../utils/api';
import Alert from '../../../components/Alert';

export default function ReviewSection() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [alert, setAlert] = useState({ message: '', status: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ambil data user yang login (null jika belum login)
    const { data: userData } = useSWR('/api/users/auth/me', fetcher, {
        onError: () => {} // Suppress error jika belum login
    });

    // Ambil 5 review terbaru
    const { data: reviewsData, isLoading } = useSWR('/api/reviews/latest?limit=5', fetcher);

    const reviews = reviewsData?.data || [];
    const isLoggedIn = !!userData?.id;

    // Format tanggal
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
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
                    className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    // Submit review
    const onSubmit = async (data) => {
        if (!isLoggedIn) {
            setAlert({ message: 'Silakan login terlebih dahulu untuk memberikan review.', status: 401 });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/api/reviews/create', {
                user_id: userData.id,
                full_name: userData.full_name || userData.email,
                rating: parseInt(data.rating),
                comment: data.comment
            });

            if (response.status === 201) {
                setAlert({ message: 'Review berhasil ditambahkan!', status: 201 });
                reset();
                // Refresh data reviews
                mutate('/api/reviews/latest?limit=5');
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'Gagal menambahkan review.';
            setAlert({ message, status: error?.response?.status || 500 });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className='bg-base-100 my-10 py-16 px-4 min-h-screen md:px-20'>
            {/* Alert */}
            <div className="fixed top-4 right-4 z-50">
                {Alert(alert.message, alert.status)}
            </div>

            <div className='max-w-6xl mx-auto'>
                <h2 className='text-3xl font-bold text-center mb-2'>Ulasan Tamu</h2>
                <p className='text-center text-gray-500 mb-10'>Apa kata mereka tentang StayIn ID</p>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* List Reviews */}
                    <div className='space-y-4'>
                        <h3 className='text-xl font-semibold mb-4'>Review Terbaru</h3>
                        
                        {isLoading ? (
                            <div className='flex justify-center py-10'>
                                <span className='loading loading-spinner loading-lg'></span>
                            </div>
                        ) : reviews.length === 0 ? (
                            <div className='text-center py-10 bg-base-100 rounded-lg'>
                                <p className='text-gray-500'>Belum ada review.</p>
                                <p className='text-sm text-gray-400 mt-2'>Jadilah yang pertama memberikan ulasan!</p>
                            </div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className='card bg-base-100 shadow-sm'>
                                    <div className='card-body py-4'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <h4 className='font-semibold'>{review.full_name || 'Anonymous'}</h4>
                                                <div className='flex items-center gap-1'>
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <span className='text-xs text-gray-400'>
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                        <p className='text-sm text-gray-600 mt-2'>{review.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Form Review */}
                    <div>
                        <h3 className='text-xl font-semibold mb-4'>Berikan Ulasan Anda</h3>
                        
                        {!isLoggedIn ? (
                            <div className='card bg-base-100 shadow-sm'>
                                <div className='card-body text-center'>
                                    <p className='text-gray-500 mb-4'>
                                        Silakan login terlebih dahulu untuk memberikan review.
                                    </p>
                                    <a href='/login' className='btn btn-primary'>
                                        Login Sekarang
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className='card bg-base-100 shadow-sm'>
                                <div className='card-body'>
                                    <p className='text-sm text-gray-500 mb-4'>
                                        Login sebagai: <span className='font-semibold'>{userData.email}</span>
                                    </p>
                                    
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {/* Rating */}
                                        <div className='form-control mb-4'>
                                            <label className='label'>
                                                <span className='label-text font-medium'>Rating</span>
                                            </label>
                                            <div className='rating rating-lg'>
                                                {[1, 2, 3, 4, 5].map((value) => (
                                                    <input
                                                        key={value}
                                                        type='radio'
                                                        {...register('rating', { required: 'Rating wajib dipilih' })}
                                                        value={value}
                                                        className='mask mask-star-2 bg-yellow-400'
                                                    />
                                                ))}
                                            </div>
                                            {errors.rating && (
                                                <span className='text-error text-sm mt-1'>{errors.rating.message}</span>
                                            )}
                                        </div>

                                        {/* Comment */}
                                        <div className='form-control mb-4'>
                                            <label className='label'>
                                                <span className='label-text font-medium'>Komentar</span>
                                            </label>
                                            <textarea
                                                {...register('comment', { 
                                                    required: 'Komentar wajib diisi',
                                                    minLength: { value: 10, message: 'Komentar minimal 10 karakter' }
                                                })}
                                                className='textarea textarea-bordered h-24'
                                                placeholder='Ceritakan pengalaman Anda menginap di StayIn ID...'
                                            ></textarea>
                                            {errors.comment && (
                                                <span className='text-error text-sm mt-1'>{errors.comment.message}</span>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button 
                                            type='submit' 
                                            className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Mengirim...' : 'Kirim Review'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
