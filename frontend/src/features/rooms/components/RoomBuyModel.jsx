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

export default function RoomBuyModel({ id }) {
    // frontend akan memilih tipe kamar, lalu backend akan memberikan tipe kamar paling pertama yang availabel
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


    const selectedRoomType = useWatch({
        control,
        name: ['room_type']
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId.current == null) {
                const res = await api.get(`${import.meta.env.VITE_API_URL}/api/users/auth/me`);
                userId.current = res.data.id;
            }
        };
        fetchUserData();
    }, []);

    setValue('user_id', userId.current);

    // mengambil data kamar pertama yang tersedia sesuai tipe pilihan
    useEffect(() => {
        const fetchRoomData = async () => {
            if (selectedRoomType) {
                setLoading(true);
                try {
                    // Ambil data relevan pertama yang tersedia dari API
                    const res = await api.get(`${import.meta.env.VITE_API_URL}/api/rooms`);
                    const data = res.data.filter(room => room.room_type === selectedRoomType[0] && room.status === 'tersedia');
                    
                    // Save data kedalam form
                    setValue('capacity', data[0]?.capacity || 0);
                    setValue('price', data[0]?.price || 0);
                    setValue('room_number', data[0]?.room_number || '');
                    
                    // Simpan data kamar ke state
                    setRoomData(data[0]);
                } catch (error) {
                    setRoomData(null);
                    console.error('Error fetching room data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setRoomData(null);
            }
        };

        fetchRoomData();
    }, [selectedRoomType])

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            
            // Buat booking
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
                product_name: `Kamar ${data.room_type} - ${data.room_number}`,
                capacity: data.capacity,
                price: data.price,
                quantity: 1
            };

            const payment = await createPayment(paymentData, `${import.meta.env.VITE_API_URL}/api/payments/create`);

            console.log(`Booking: ${booking.status}`);
            console.log(`Payment: ${payment.status} - ${payment.token} - ${payment.url} - ${payment.orderId}`)
            setPaymentUrl(payment.url);
        } catch (error) {
            setLoading(false)
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <dialog id={id} className="modal">
            {loading && <Loading />}
            <div className="modal-box w-11/12 max-w-5xl overflow-y-scroll md:overflow-y-hidden">
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

                    {paymentUrl && (
                        <p>{paymentUrl}</p>
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