// Halaman Admin: Manajemen Kamar
// Fokus: List, cari, dan CRUD kamar dengan UI sederhana untuk pemula.
import Drawer from '../../../../components/Drawer';
// Menu admin dibangun via helper agar DRY
import { buildAdminMenu } from '../../../../utils/helpers/adminMenu';
import { DeleteModal, EditModal, CreateModal } from '../../../../components/Modal.jsx';
import { GetStat } from '../../../../helpers/GetStat.js';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Alert from '../../../../components/Alert.jsx';
import api from '../../../../utils/api';

export default function AdminKamar() {
    const deleteForm = useForm();
    const editForm = useForm();
    const createForm = useForm();
    const [alert, setAlert] = useState({
        message: '',
        status: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    
    // 1) Ambil data kamar dari backend dengan SWR helper
    const { data: rooms, isLoading } = GetStat(`${import.meta.env.VITE_API_URL}/api/rooms`);
    
    // 2) Pencarian sederhana berdasarkan nomor atau tipe kamar
    const filteredRooms = rooms?.filter(room => 
        room.room_number?.toString().includes(searchQuery) ||
        room.room_type?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    
    // 3) Handler Hapus Kamar
    const submitDelete = async (data) => {
        try {
            const deleted = await api({
                method: 'DELETE',
                url: '/api/rooms/delete',
                data: { room_number: data.room_number }
            });
            if (deleted.status === 200) {
                setAlert({ message: deleted?.data?.message || 'Kamar berhasil dihapus', status: 200 });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setAlert({ message: deleted?.data?.message || 'Terjadi kesalahan', status: deleted.status });
            }
        } catch (error) {
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };

    // 4) Handler Edit Kamar
    const submitEdit = async (data) => {
        try {
            const edited = await api.put('/api/rooms/update', { room_number: data.room_number, room_type: data.room_type, price: Number(data.price), capacity: Number(data.capacity) });
            if (edited.status === 200) {
                setAlert({ message: edited?.data?.message || 'Kamar berhasil diperbarui', status: 200 });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setAlert({ message: edited?.data?.message || 'Terjadi kesalahan', status: edited.status });
            }
        } catch (error) {
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };

    // 5) Handler Tambah Kamar
    const submitCreate = async (data) => {
        try {
            const created = await api.post('/api/rooms/create', { room_number: data.room_number, room_type: data.room_type, price: Number(data.price), capacity: Number(data.capacity) });
            if (created.status === 201) {
                setAlert({ message: created?.data?.message || 'Kamar berhasil dibuat', status: 201 });
                document.getElementById('create-modal').close();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setAlert({ message: created?.data?.message || 'Terjadi kesalahan', status: created.status });
            }
        } catch (error) {
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };

    // 6) Menu Admin konsisten via helper
    const menuItems = buildAdminMenu(navigate);

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <>
            <div className="bg-base-200 min-h-screen">
                {/* Alert sederhana di pojok kanan atas */}
                <div className="fixed top-4 right-4 z-50">
                    {Alert(alert.message, alert.status)}
                </div>                
                <Drawer title={'Manajemen Kamar'} lists={menuItems}>
                    <div className='flex justify-center content-center my-20'>
                        <div className='card w-11/12 bg-base-100 shadow-sm'>
                            <div className='card-body'>
                                <div className='flex items-center justify-between gap-4'>
                                    <h2 className="card-title shrink-0">Manajemen Kamar</h2>
                                    <label className="input input-bordered flex items-center gap-2 flex-1 max-w-md">
                                        <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                            <g
                                            strokeLinejoin="round"
                                            strokeLinecap="round"
                                            strokeWidth="2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            >
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.3-4.3"></path>
                                            </g>
                                        </svg>
                                        <input 
                                            type="search" 
                                            placeholder="Cari nomor atau tipe kamar..." 
                                            className="grow" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </label>
                                    <button className="btn btn-primary shrink-0" onClick={()=>document.getElementById('create-modal').showModal()}>Tambah Kamar</button>
                                </div>
                                <div className='divider'></div>
                                <div className='overflow-x-auto w-full'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>Nomor Kamar</th>
                                                <th>Tipe Kamar</th>
                                                <th>Harga</th>
                                                <th>Kapasitas</th>
                                                <th>Dibuat</th>
                                                <th>Diperbarui</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                Array.isArray(filteredRooms) && filteredRooms.length > 0 ? (
                                                    filteredRooms.map((room) => (
                                                        <tr key={room.room_number} className='hover:bg-gray-400'>
                                                            <td>{room.room_number}</td>
                                                            <td>{room.room_type}</td>
                                                            <td>Rp {Number(room.price).toLocaleString('id-ID')}</td>
                                                            <td>{room.capacity} orang</td>
                                                            <td>{new Date(room.created_at).toLocaleDateString('id-ID')}</td>
                                                            <td>{new Date(room.updated_at).toLocaleDateString('id-ID')}</td>
                                                            <td className='flex gap-2'>
                                                                <button className='btn btn-ghost hover:bg-red-500' onClick={()=>document.getElementById('delete-modal').showModal()}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                                <button className='btn btn-ghost' onClick={()=>document.getElementById('edit-modal').showModal()}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center">Tidak ada kamar yang ditemukan.</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>

                                    {/* Modal Delete */}
                                    <DeleteModal>
                                        <form onSubmit={deleteForm.handleSubmit(submitDelete)}>
                                            <div>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Nomor Kamar</legend>
                                                    <input 
                                                    type="text" 
                                                    {...deleteForm.register('room_number')}
                                                    placeholder="101" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end'>
                                                <button type='submit' className='btn btn-soft hover:btn-error'>Hapus</button>
                                            </div>
                                        </form>
                                    </DeleteModal>

                                    {/* Modal Create */}
                                    <CreateModal>
                                        <form onSubmit={createForm.handleSubmit(submitCreate)}>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Nomor Kamar</legend>
                                                    <input 
                                                    type="text" 
                                                    {...createForm.register('room_number')}
                                                    placeholder="101" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Tipe Kamar</legend>
                                                    <input 
                                                    type="text" 
                                                    {...createForm.register('room_type')}
                                                    placeholder="Deluxe" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Harga</legend>
                                                    <input 
                                                    type="number" 
                                                    {...createForm.register('price')}
                                                    placeholder="500000" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Kapasitas</legend>
                                                    <input 
                                                    type="number" 
                                                    {...createForm.register('capacity')}
                                                    placeholder="2" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end mt-10'>
                                                <button type='submit' className='btn btn-soft hover:btn-success'>Buat</button>
                                            </div>
                                        </form>
                                    </CreateModal>

                                    {/* Modal Edit */}
                                    <EditModal>
                                        <form onSubmit={editForm.handleSubmit(submitEdit)}>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Nomor Kamar</legend>
                                                    <input 
                                                    type="text" 
                                                    {...editForm.register('room_number')}
                                                    placeholder="101" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Tipe Kamar Baru</legend>
                                                    <input 
                                                    type="text" 
                                                    {...editForm.register('room_type')}
                                                    placeholder="Deluxe" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Harga Baru</legend>
                                                    <input 
                                                    type="number" 
                                                    {...editForm.register('price')}
                                                    placeholder="500000" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Kapasitas Baru</legend>
                                                    <input 
                                                    type="number" 
                                                    {...editForm.register('capacity')}
                                                    placeholder="2" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end mt-10'>
                                                <button type='submit' className='btn btn-soft hover:btn-info'>Perbarui</button>
                                            </div>
                                        </form>
                                    </EditModal>
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        </>
    );
}
