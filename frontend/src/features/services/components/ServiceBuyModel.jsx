/**
 * 
 * TODO:
 * Dari frontend, client akan mengirim data yang diperlukan untuk memesan service.
 * Backend lalu akan memproses data itu. membuat link pembayaran midtrans
 * menyimpan data di service_orders lalu mengembalikan link pembayaran ke frontend
 * Frontend lalu akan mengarahkan user ke link pembayaran midtrans
 */

/**
 * TODO:
 * buat API endpoint di backend yang menerima data pemesanan service
 * endpoint ini akan membuat data service_order baru di database dengan status 'pending'
 * lalu menghubungi midtrans untuk membuat transaksi pembayaran
 * simpan response midtrans (terutama payment_url) di database
 * kembalikan payment_url ke frontend
 * DONE:
 * pengumpulan data dari form pemesanan service
 * pengambilan data service berdasarkan kategori
 */
import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api';
import Loading from '../../../components/Loading.jsx';

const createOrder =async (data, url) => {
    const payment = await api.post(url, data);
    return {
        message: payment.data.message,
        token: payment.data.token,
        url: payment.data.url,
        status: payment.status,
        orderId: payment.data.orderId
    };
};

const postSnapCallback = async (eventName, payload, order) => {
    try {
        const fn = window?.__stayinMidtransCallback;
        if (typeof fn === 'function') {
            // Pass the orders callback URL as 4th parameter
            await fn(eventName, payload, { orderId: order?.orderId }, '/api/orders/callback');
            return;
        }
        // Fallback (should not be needed if index.html is set)
        const resp = await api.post(`${import.meta.env.VITE_API_URL}/api/orders/callback`, {
            event: eventName,
            payload,
            orderId: order?.orderId,
        });
        console.log('Callback response:', resp?.data);
    } catch (err) {
        console.error('Callback POST failed:', err?.response?.data || err);
    }
};

export default function ServiceBuyModel({ id }) {
    const { 
        register, 
        handleSubmit,
        setValue,
        control,
        reset
    } = useForm({
        defaultValues: {
            user_id: '',
            full_name: '',
            email: '',
            phone: '',
            service_category: '',
            service_id: '',
            quantity: 1,
            price: 0,
            total_amount: 0,
            notes: 'Tidak Ada',
            ordered_at: ''
        }
    });

    const userId = useRef(null);
    const [serviceList, setServiceList] = useState([]);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Watch for service category changes
    const selectedCategory = useWatch({
        control,
        name: 'service_category'
    });

    // Watch for selected service changes
    const selectedServiceId = useWatch({
        control,
        name: 'service_id'
    });

    // Watch for quantity changes
    const quantity = useWatch({
        control,
        name: 'quantity'
    });

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get(`${import.meta.env.VITE_API_URL}/api/users/auth/me`);
                userId.current = res.data.id;
                setValue('user_id', userId.current, { shouldValidate: true, shouldDirty: true });
            } catch (err) {
                console.error('Error fetching user data:', err?.response?.data || err);
            }
        };

        fetchUserData();
    }, [setValue]);

    // Fetch services by category
    useEffect(() => {
        const fetchServiceData = async () => {
            if (!selectedCategory) {
                setServiceList([]);
                setSelectedService(null);
                return;
            }

            setLoading(true);
            try {
                const res = await api.get(`${import.meta.env.VITE_API_URL}/api/services/`);
                const data = res.data.filter(
                    (service) => service.category === selectedCategory
                );
                setServiceList(data || []);
                // Reset service selection when category changes
                setValue('service_id', '');
                setSelectedService(null);
                setTotalAmount(0);
            } catch (error) {
                setServiceList([]);
                console.error('Error fetching service data:', error?.response?.data || error);
            } finally {
                setLoading(false);
            }
        };

        fetchServiceData();
    }, [selectedCategory, setValue]);

    // Update selected service when service_id changes
    useEffect(() => {
        if (selectedServiceId && serviceList.length > 0) {
            const service = serviceList.find(s => s.id === parseInt(selectedServiceId));
            if (service) {
                setSelectedService(service);
            }
        } else {
            setSelectedService(null);
            setTotalAmount(0);
        }
    }, [selectedServiceId, serviceList]);

    // Recalculate total when quantity or selectedService changes
    useEffect(() => {
        if (selectedService) {
            const qty = parseInt(quantity) || 1;
            const total = selectedService.price * qty;
            setValue('price', selectedService.price);
            setValue('service_name', selectedService.name);
            setTotalAmount(total);
        }
    }, [quantity, selectedService, setValue]);

    const onSubmit = async (data) => {
        const submitData = {
            ...data,
            total_amount: totalAmount
        };
        try {
            setLoading(true);
            const order = await createOrder(submitData, `${import.meta.env.VITE_API_URL}/api/orders/create`);
            
            if (order?.token && window?.snap?.pay) {
                window.snap.pay(order.token, {
                    onSuccess: (result) => {
                        postSnapCallback('success', result, order)
                        navigate('/user');
                    },
                    onPending: (result) => {
                        postSnapCallback('pending', result, order);
                    },
                    onError: (result) => {
                        postSnapCallback('error', result, order);
                    },
                    onClose: () => {
                        postSnapCallback('close', { message: 'User closed the popup.' });
                    }
                });
            } else {
                setPaymentUrl(order?.url);
            }
        } catch (error) {
            console.log(error);
        } finally {
            document.getElementById(id).close();
            reset();
            setSelectedService(null);
            setServiceList([]);
            setTotalAmount(0);
            setLoading(false);
            console.log('Submit payload:', submitData);
        }
    };

    const handleClose = () => {
        document.getElementById(id).close();
        reset();
        setSelectedService(null);
        setServiceList([]);
        setTotalAmount(0);
    };

    return (
        <dialog id={id} className="modal">
            <div className="modal-box w-11/12 max-w-5xl overflow-y-scroll">
                {loading && <Loading />}
                <h3 className="font-bold text-lg">Pemesanan Layanan</h3>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Row 1: Nama & Email */}
                    <div className='flex flex-col md:flex-row my-4 gap-4'>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Nama Lengkap</span>
                            </label>
                            <input 
                                type="text" 
                                {...register('full_name', { required: true })}
                                placeholder="John Doe" 
                                className='input rounded-none w-full'
                                required 
                            />
                        </div>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input 
                                type="email" 
                                {...register('email', { required: true })}
                                placeholder="johndoe@email.com" 
                                className='input rounded-none w-full'
                                required 
                            />
                        </div>
                    </div>

                    {/* Row 2: Phone & Service Category */}
                    <div className='flex flex-col md:flex-row my-4 gap-4'>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">No. Telepon</span>
                            </label>
                            <input 
                                type="text" 
                                {...register('phone', { required: true })}
                                placeholder="08xxxxxxxxxx" 
                                className='input rounded-none w-full'
                                required 
                            />
                        </div>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Kategori Layanan</span>
                            </label>
                            <select 
                                defaultValue='' 
                                className='select rounded-none w-full' 
                                {...register('service_category', { required: true })}
                            >
                                <option value='' disabled>Pilih Kategori Layanan</option>
                                <option value="room_service">Room Service</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="food">Food & Beverage</option>
                                <option value="laundry">Laundry</option>
                                <option value="spa">Spa & Wellness</option>
                            </select>
                        </div>
                    </div>

                    <div className='flex flex-col md:flex-row my-4 gap-4'>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Pilih Layanan</span>
                            </label>
                            <select 
                                defaultValue='' 
                                className='select rounded-none w-full' 
                                {...register('service_id', { required: true })}
                                disabled={serviceList.length === 0}
                            >
                                <option value='' disabled>
                                    {serviceList.length === 0 ? 'Pilih kategori terlebih dahulu' : 'Pilih Layanan'}
                                </option>
                                {serviceList.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.name} - {Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(service.price)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Jumlah</span>
                            </label>
                            <input 
                                type="number" 
                                {...register('quantity', { required: true, min: 1, valueAsNumber: true })}
                                min="1"
                                defaultValue={1}
                                className='input rounded-none w-full'
                                required 
                            />
                        </div>
                    </div>

                    {/* Display Price Info */}
                    {selectedService && (
                        <div className='flex flex-col md:flex-row my-4 gap-4 bg-base-100 p-4 rounded-lg'>
                            <div className='flex flex-col w-full md:w-1/2'>
                                <label className="label">
                                    <span className="label-text">Harga Per Unit</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedService.price)}
                                    className='input input-ghost rounded-none w-full bg-base-100' 
                                    disabled
                                />
                            </div>
                            <div className='flex flex-col w-full md:w-1/2'>
                                <label className="label">
                                    <span className="label-text font-bold">Total Harga</span>
                                </label>
                                <input 
                                    type="text" 
                                    value={Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalAmount)}
                                    className='input input-ghost rounded-none w-full bg-base-100 font-bold text-primary' 
                                    disabled
                                />
                            </div>
                        </div>
                    )}

                    {/* Row 4: Scheduled Date & Time */}
                    <div className='flex flex-col md:flex-row my-4 gap-4'>
                        <div className='flex flex-col w-full md:w-1/2'>
                            <label className="label">
                                <span className="label-text">Tanggal Layanan</span>
                            </label>
                            <input 
                                type="datetime-local" 
                                className='input rounded-none w-full' 
                                {...register('ordered_at', { required: true })}
                                required
                            />
                        </div>
                    </div>

                    {/* Row 5: Notes */}
                    <div className='flex flex-col my-4'>
                        <label className="label">
                            <span className="label-text">Catatan Tambahan</span>
                        </label>
                        <textarea 
                            {...register('notes')}
                            placeholder="Catatan khusus untuk layanan (opsional)" 
                            className='textarea rounded-none w-full'
                            rows={3}
                        />
                    </div>

                    {paymentUrl && (
                        <p>
                            <a className='link hover:text-base-300' href={paymentUrl}>Lanjut ke pembayaran.</a>
                        </p>
                    )}

                    <div className="modal-action">
                        <button type='submit' className="btn btn-primary px-20">Pesan</button>
                        <button type='button' onClick={handleClose} className="btn btn-soft px-20">Close</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}