/**
 * 
 * TODO:
 * Dari frontend, client akan mengirim data yang diperlukan.
 * Backend lalu akan memproses data itu. membuat link pembayaran midtrans
 * menyimpan data di bookings lalu mengembalikan link pembayaran ke frontend
 * Frontend lalu akan mengarahkan user ke link pembayaran midtrans
 */


/**
 * TODO:
 * buat API endpoint di backend yang menerima data pemesanan kamar
 * endpoint ini akan membuat data booking baru di database dengan status 'pending'
 * lalu menghubungi midtrans untuk membuat transaksi pembayaran
 * simpan response midtrans (terutama payment_url) di database
 * kembalikan payment_url ke frontend
 * DONE:
 * pengempulan data dari form pemesanan kamar
 * pengambilan data kamar pertama yang tersedia sesuai tipe pilihan
 */
import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import Loading from '../../../components/Loading.jsx'

const createBooking = async (data, url) => {
    const booking = await api.post(url, data);
    return {
        message: booking.data.message,
        status: booking.status
    };
}

const createPayment = async (data, url) => {
    const payment = await api.post(url, data);
    return {
        message: payment.data.message,
        token: payment.data.token,
        url: payment.data.url,
        status: payment.status,
        orderId: payment.data.orderId
    };
}

const postSnapCallback = async (eventName, payload, payment) => {
    try {
        const fn = window?.__stayinMidtransCallback;
        if (typeof fn === 'function') {
            await fn(eventName, payload, { orderId: payment?.orderId });
            return;
        }
        // Fallback (should not be needed if index.html is set)
        const resp = await api.post(`${import.meta.env.VITE_API_URL}/api/payments/callback`, {
            event: eventName,
            payload,
            orderId: payment?.orderId,
        });
        console.log('Callback response:', resp?.data);
    } catch (err) {
        console.error('Callback POST failed:', err?.response?.data || err);
    }
};

export default function RoomBuyModel({ id }) {
    const { 
        register, 
        handleSubmit,
        setValue,
        control
    } = useForm({
        defaultValues: {
            user_id: '',
            full_name: '',
            email: '',
            phone: '',
            room_type: '',
            room_number: '',
            check_in : '',
            check_out: '',
            capacity: 0,
            price: 0,
        }
    });

    const userId = useRef(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [roomData, setRoomData] = useState();
    const [loading, setLoading] = useState(false);
    const [totalNights, setTotalNights] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const navigate = useNavigate();

    // Pakai string, bukan array
    const selectedRoomType = useWatch({
        control,
        name: 'room_type'
    });

    // Watch check_in dan check_out untuk kalkulasi jumlah malam
    const checkInDate = useWatch({ control, name: 'check_in' });
    const checkOutDate = useWatch({ control, name: 'check_out' });

    // Hitung jumlah malam dan total harga saat tanggal berubah
    useEffect(() => {
        if (checkInDate && checkOutDate && roomData?.price) {
            const checkIn = new Date(checkInDate);
            const checkOut = new Date(checkOutDate);
            
            // Hitung selisih dalam milidetik lalu konversi ke hari
            const diffTime = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (nights > 0) {
                setTotalNights(nights);
                setTotalAmount(roomData.price * nights);
            } else {
                setTotalNights(0);
                setTotalAmount(0);
            }
        } else {
            setTotalNights(0);
            setTotalAmount(0);
        }
    }, [checkInDate, checkOutDate, roomData?.price]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get(`${import.meta.env.VITE_API_URL}/api/users/auth/me`);
                userId.current = res.data.id;

                // Set form value DI SINI (bukan saat render)
                setValue('user_id', res.data.id, { shouldValidate: true, shouldDirty: true });
            } catch (err) {
                console.error('Error fetching user data:', err?.response?.data || err);
            }
        };

        fetchUserData();
    }, [setValue]);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!selectedRoomType) {
                setRoomData(null);
                return;
            }

            setLoading(true);
            try {
                const res = await api.get(`${import.meta.env.VITE_API_URL}/api/rooms`);
                const data = res.data.filter(
                    (room) => room.room_type === selectedRoomType && room.status === 'tersedia'
                );

                setValue('capacity', data[0]?.capacity || 0);
                setValue('price', data[0]?.price || 0);
                setValue('room_number', data[0]?.room_number || '');
                setRoomData(data[0] || null);
            } catch (error) {
                setRoomData(null);
                console.error('Error fetching room data:', error?.response?.data || error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [selectedRoomType, setValue]);

    const onSubmit = async (data) => {
        console.log('Submit payload:', data);

        // Validasi: pastikan jumlah malam valid
        if (totalNights <= 0) {
            alert('Tanggal check-out harus setelah tanggal check-in.');
            return;
        }

        try {
            setLoading(true);

            const bookData = {
                user_id: data.user_id,
                room_number: data.room_number,
                check_in: data.check_in,
                check_out: data.check_out
            };

            const booking = await createBooking(bookData, `${import.meta.env.VITE_API_URL}/api/bookings/create`);

            const paymentData = {
                user_id : data.user_id,
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                room_type: data.room_type,
                room_number: data.room_number,
                product_name: `Kamar ${data.room_type} - ${data.room_number} (${totalNights} malam)`,
                capacity: data.capacity,
                price: data.price,
                quantity: totalNights,  // Jumlah malam sebagai quantity
                total_amount: totalAmount  // Total harga yang sudah dihitung
            };

            const payment = await createPayment(paymentData, `${import.meta.env.VITE_API_URL}/api/payments/create`);

            console.log('Booking:', booking);
            console.log('Payment:', payment);

            document.getElementById(id).close();

            if (payment?.token && window?.snap?.pay) {
                window.snap.pay(payment.token, {
                    onSuccess: (result) => {
                        postSnapCallback('success', result, payment);
                        navigate('/user');
                    },
                    onPending: (result) => {
                        postSnapCallback('pending', result, payment);
                    },
                    onError: (result) => {
                        postSnapCallback('error', result, payment);
                    },
                    onClose: () => {
                        postSnapCallback('close', { message: 'User closed the popup.' });
                    }
                });
            } else {
                // Fallback: show redirect URL if snap is not loaded
                setPaymentUrl(payment.url);
            }
        } catch (error) {
            // Ini biar jelas errornya dari backend apa
            console.error('Submit error:', error?.response?.status, error?.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <dialog id={id} className="modal">
            <div className="modal-box w-11/12 max-w-5xl overflow-y-scroll">
                {loading && <Loading />}
                <h3 className="font-bold text-lg">Pemesanan Kamar</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='flex flex-row my-4 gap-4'>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">Nama Lengkap</span>
                            </label>
                            <input 
                                type="text" 
                                name="full_name" 
                                {...register('full_name')}
                                placeholder="John Doe" 
                                className='input rounded-none'
                                required />
                        </div>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                {...register('email')}
                                placeholder="johndoe@email.com" 
                                className='input rounded-none'
                                required />
                        </div>
                    </div>

                    <div className='flex flex-row my-4 gap-4'>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">No. Telepon</span>
                            </label>
                            <input 
                                type="text" 
                                name="phone" 
                                {...register('phone')}
                                placeholder="08xxxxxxxxxx" 
                                className='input rounded-none'
                                required />
                        </div>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">Tipe Kamar</span>
                            </label>
                            <select defaultValue='Daftar Tipe Kamar'  className='select rounded-none' {...register('room_type', {required:true})}>
                                <option disabled={true}>Daftar Tipe Kamar</option>
                                <option value="standar">Standar</option>
                                <option value="double">Double</option>
                                <option value="exclusive">Exclusive</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex flex-row my-4 gap-4'>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">Tanggal Check in</span>
                            </label>
                            <input type="datetime-local" className='input rounded-none' {...register('check_in')}/>
                        </div>
                        <div className='flex flex-col w-11/12'>
                            <label className="label">
                                <span className="label-text">Tanggal Check out</span>
                            </label>
                            <input type="datetime-local" className='input rounded-none' {...register('check_out')}/>
                        </div>
                    </div>

                    {roomData && (
                        <div className='flex flex-row my-4 gap-4'>
                            <div className='flex flex-col w-11/12'>
                                <label className="label">
                                    <span className="label-text">Maksimal Tamu Kamar</span>
                                </label>
                                <input type="text" placeholder={roomData.capacity} className='input input-ghost rounded-none' disabled/>
                            </div>
                            <div className='flex flex-col w-11/12'>
                                <label className="label">
                                    <span className="label-text">Harga Per Malam</span>
                                </label>
                                <input type="text" placeholder={Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(roomData.price)} className='input input-ghost rounded-none' disabled/>
                            </div>
                        </div>
                    )}

                    {/* Tampilkan perhitungan total harga */}
                    {totalNights > 0 && roomData && (
                        <div className='bg-base-200 p-4 rounded-lg my-4'>
                            <h4 className='font-semibold text-lg mb-2'>Rincian Harga</h4>
                            <div className='flex justify-between'>
                                <span>Harga per malam</span>
                                <span>{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(roomData.price)}</span>
                            </div>
                            <div className='flex justify-between'>
                                <span>Jumlah malam</span>
                                <span>{totalNights} malam</span>
                            </div>
                            <div className='divider my-1'></div>
                            <div className='flex justify-between font-bold text-lg'>
                                <span>Total</span>
                                <span className='text-primary'>{Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}</span>
                            </div>
                        </div>
                    )}

                    {paymentUrl && (
                        <p>
                            <a className='link hover:text-base-300' href={paymentUrl}>Lanjut ke pembayaran.</a>
                        </p>
                    )}

                    <div className="modal-action">
                        <button type='submit' className="btn btn-primary px-20">Pesan</button>
                        {/* if there is a button in form, it will close the modal */}
                        <button type='button' onClick={()=>document.getElementById(id).close()} className="btn btn-soft px-20">Close</button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}