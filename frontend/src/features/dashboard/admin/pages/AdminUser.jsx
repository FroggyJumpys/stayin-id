// Halaman Admin: Manajemen User
// Fokus: List, cari, dan CRUD user dengan form sederhana.
import Drawer from '../../../../components/Drawer';
import { buildAdminMenu } from '../../../../utils/helpers/adminMenu';
import { DeleteModal, EditModal, CreateModal } from '../../../../components/Modal.jsx';
import { GetStat } from '../../../../helpers/GetStat.js';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Alert from '../../../../components/Alert.jsx';
import api from '../../../../utils/api';


export default function AdminUser() {
    const deleteForm = useForm();
    const editForm = useForm();
    const createForm = useForm();
    const [alert, setAlert] = useState({
        message: '',
        status: 0
    });
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    
    const { data: users, isLoading } = GetStat(`${import.meta.env.VITE_API_URL}/api/users`);
    
    // 1) Filter pencarian berdasarkan email
    const filteredUsers = users?.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    
    const submitDelete = async (data) => {
        try {
            console.log('Data delete yang dikirim:', data);
            const deleted = await api({
                method: 'DELETE',
                url: '/api/users/auth/delete',
                data: { email: data.email }
            });
            if (deleted.status === 200) {
                setAlert({ message: deleted?.data?.message || 'User berhasil dihapus', status: 200 });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setAlert({ message: deleted?.data?.message || 'Terjadi kesalahan', status: deleted.status });
            }
        } catch (error) {
            console.error('Error delete:', error.response?.data || error.message);
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };    

    const submitEdit = async (data) => {
        try {
            const edited = await api.put('/api/users/auth/update', { target_email: data.target_email, full_name: data.full_name, email: data.email, password: data.password, phone: data.phone, role: data.role });
            if (edited.status === 200) {
                setAlert({ message: edited?.data?.message || 'Success', status: 200 });
                setTimeout(() => {
                    window.location.reload();
                }, 5000);
            } else {
                setAlert({ message: edited?.data?.message || 'Success', status: edited.status });
            }
        } catch (error) {
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };

    const submitCreate = async (data) => {
        try {
            const created = await api.post('/api/users/auth/register', { full_name: data.full_name, email: data.email, password: data.password, phone: data.phone, role: data.role });
            console.log('Response:', created);
            if (created.status === 201) {
                setAlert({ message: created?.data?.message || 'User berhasil dibuat', status: 201 });
                document.getElementById('create-modal').close();
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setAlert({ message: created?.data?.message || 'Success', status: created.status });
            }
        } catch (error) {
            console.error('Error detail:', error.response?.data);
            setAlert({ message: error.response?.data?.message || error.message || 'Terjadi kesalahan', status: error.response?.status || 400 });
        }
    };

    // 2) Menu Admin via helper
    const menuItems = buildAdminMenu(navigate);

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <>
            <div className="bg-base-200 min-h-screen">
                    {/* Alert sederhana di pojok kanan atas */}
                    <div className="fixed top-4 right-4 z-50">
                        {Alert(alert.message, alert.status)}
                    </div>                
                    <Drawer title={'Manajemen User'} lists={menuItems} >
                    <div className='flex justify-center content-center my-20'>
                        <div className='card w-11/12 bg-base-100 shadow-sm'>
                            <div className='card-body'>
                                <div className='flex items-center justify-between gap-4'>
                                    <h2 className="card-title shrink-0">Manajemen User</h2>
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
                                            placeholder="Cari berdasarkan email..." 
                                            className="grow" 
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </label>
                                    <button className="btn btn-primary shrink-0" onClick={()=>document.getElementById('create-modal').showModal()}>Create</button>
                                </div>
                                <div className='divider'></div>
                                <div className='overflow-x-auto w-full'>
                                    <table className='table w-full'>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Full Name</th>
                                                <th>Email</th>
                                                <th>Password Hash</th>
                                                <th>Phone</th>
                                                <th>Role</th>
                                                <th>Dibuat Pada</th>
                                                <th>Diperbarui Pada</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                                                    filteredUsers.map((user) => (
                                                        <tr key={user.id} className='hover:bg-gray-400'>
                                                            <td>{user.id}</td>
                                                            <td>{user.full_name}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.password_hash}</td>
                                                            <td>{user.phone}</td>
                                                            <td>{user.role}</td>
                                                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                            <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                                                            <td>
                                                                <button className='btn btn-ghost hover:bg-red-500' onClick={()=>document.getElementById('delete-modal').showModal()}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                            <td>
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
                                                        <td colSpan="9" className="text-center">Tidak ada user yang ditemukan.</td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>

                                    <DeleteModal>
                                        <form onSubmit={deleteForm.handleSubmit(submitDelete)}>
                                            <div>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Email</legend>
                                                    <input 
                                                    type="text" 
                                                    name="email" 
                                                    {...deleteForm.register('email')}
                                                    placeholder="mail@mail.site" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end'>
                                                <button type='submit' className='btn btn-soft hover:btn-error'>Delete</button>
                                            </div>
                                        </form>
                                    </DeleteModal>

                                    <CreateModal>
                                        <form onSubmit={createForm.handleSubmit(submitCreate)}>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Nama Lengkap</legend>
                                                    <input 
                                                    type="text" 
                                                    {...createForm.register('full_name')}
                                                    placeholder="John Doe" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Email</legend>
                                                    <input 
                                                    type="email" 
                                                    {...createForm.register('email')}
                                                    placeholder="mail@mail.site" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Password</legend>
                                                    <input 
                                                    type="password" 
                                                    {...createForm.register('password')}
                                                    placeholder="Password" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Nomor Telepon</legend>
                                                    <input 
                                                    type="text" 
                                                    {...createForm.register('phone')}
                                                    placeholder="121321211" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Role</legend>
                                                    <select defaultValue='guest' className="select w-48" {...createForm.register('role')}>
                                                        <option value='guest'>Guest</option>
                                                        <option value='staff'>Staff</option>
                                                        <option value='admin'>Admin</option>
                                                    </select>
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end mt-10'>
                                                <button type='submit' className='btn btn-soft hover:btn-success'>Create</button>
                                            </div>
                                        </form>
                                    </CreateModal>

                                    <EditModal>
                                        <div>
                                            <form onSubmit={editForm.handleSubmit(submitEdit)}>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Email</legend>
                                                    <input 
                                                    type="text" 
                                                    name="target_email" 
                                                    {...editForm.register('target_email')}
                                                    placeholder="mail@mail.site" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Email Baru</legend>
                                                    <input 
                                                    type="text" 
                                                    name="email" 
                                                    {...editForm.register('email')}
                                                    placeholder="mail@mail.site" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Nama<br/>Lengkap Baru</legend>
                                                    <input 
                                                    type="text" 
                                                    name="full_name" 
                                                    {...editForm.register('full_name')}
                                                    placeholder="Nama Lengkap" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Password <br/> Baru</legend>
                                                    <input 
                                                    type="password" 
                                                    name="password" 
                                                    {...editForm.register('password')}
                                                    placeholder="Password" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                            </div>
                                            <div className='flex gap-5 my-3'>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Nomor<br/>Telepon Baru</legend>
                                                    <input 
                                                    type="text" 
                                                    name="phone" 
                                                    {...editForm.register('phone')}
                                                    placeholder="Nama Lengkap" 
                                                    className='input'
                                                    required />
                                                </fieldset>
                                                <fieldset className="fieldset">
                                                    <legend className="fieldset-legend text-xl">Masukkan Role <br/> Baru</legend>
                                                    <select defaultValue='Pilih Role' className="select w-48" {...editForm.register('role')}>
                                                    <option disabled={true}>Pilih Role</option>
                                                    <option value='guest'>Guest</option>
                                                    <option value='staff'>Staff</option>
                                                    <option value='admin'>Admin</option>
                                                    </select>
                                                </fieldset>
                                            </div>
                                            <div className='flex justify-end mt-10'>
                                                <button type='submit' className='btn btn-soft hover:btn-info'>Edit</button>
                                            </div>
                                        </form>
                                        </div>
                                    </EditModal>
                                </div>
                            </div>
                        </div>
                    </div>
                </Drawer>
            </div>
        </>
    )
}