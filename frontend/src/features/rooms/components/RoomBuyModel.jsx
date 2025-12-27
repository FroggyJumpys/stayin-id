/**
 * 
 * TODO:
 * Dari frontend, client akan mengirim data yang diperlukan.
 * Backend lalu akan memproses data itu. membuat link pembayaran midtrans
 * menyimpan data di bookings lalu mengembalikan link pembayaran ke frontend
 * Frontend lalu akan mengarahkan user ke link pembayaran midtrans
 */

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { api } from '../../../utils/api';
import Loading from '../../../components/Loading.jsx'

export default function RoomBuyModel({ id }) {
    // frontend akan memilih tipe kamar, lalu backend akan memberikan tipe kamar paling pertama yang availabel
    const { 
        register, 
        handleSubmit,
        setValue,
        control
    } = useForm({
        defaultValues: {
            full_name: '',
            email: '',
            phone: '',
            room_type: '',
            check_in : '',
            check_out: '',
            capacity: 0,
            price: 0
        }
    });

    const [roomData, setRoomData] = useState();
    const [loading, setLoading] = useState(false);

    const selectedRoomType = useWatch({
        control,
        name: ['room_type']
    })

    // mengambil data kamar pertama yang tersedia sesuai tipe pilihan

    useEffect(() => {
        const fetchRoomData = async () => {
            if (selectedRoomType) {
                setLoading(true);
                try {
                    const res = await api.get(`${import.meta.env.VITE_API_URL}/api/rooms`);
                    const data = res.data.filter(room => room.room_type === selectedRoomType[0] && room.status === 'tersedia');
                    setValue('capacity', data[0]?.capacity || 0);
                    setValue('price', data[0]?.price || 0);
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

    const onSubmit = (data) => {
        console.log(data);
    }

    return (
        <dialog id={id} className="modal">
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

                    {loading && <Loading />}
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