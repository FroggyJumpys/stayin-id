// Halaman User: Setting Akun
// Fitur: Ganti password dan hapus akun dengan logout otomatis
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { buildUserMenu } from '../../../../utils/helpers/userMenu.js';
import { Card } from '../../../../components/Card.jsx';
import { EditModal, DeleteModal } from '../../../../components/Modal.jsx';
import Alert from '../../../../components/Alert.jsx';
import Drawer from '../../../../components/Drawer';
import { GetStat } from '../../../../helpers/GetStat.js';
import api from '../../../../utils/api';

export default function UserSetting() {
    const editForm = useForm();
    const deleteForm = useForm();
    const navigate = useNavigate();
    const [alert, setAlert] = useState({
        message: '',
        status: 0
    });

    // 1) Ambil data user yang login
    const { data, error, isLoading } = GetStat('/api/users/auth/me');
    const { data: userdata } = GetStat(`/api/users/${data?.email}`);
    
    // 2) Handler ganti password - logout otomatis setelah berhasil
    const editSubmit = async (data) => {
        try {
            const edited = await api.put('/api/users/auth/changepassword', { 
                email: userdata?.email, 
                old_password: data.old_password, 
                new_password: data.new_password 
            });
            
            if (edited.status === 200) {
                setAlert({ 
                    message: `${edited?.data?.message} Redirecting to login page.`, 
                    status: edited?.status 
                });
                setTimeout(async () => {
                    await api.post('/api/users/auth/logout', {});
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'Ada kesalahan dalam mengganti password akun.';
            const status = error?.response?.status || 500;
            setAlert({ message, status });
        }
    };

    // 3) Handler hapus akun - logout otomatis setelah berhasil
    const deleteSubmit = async (data) => {
        try {
            const deleted = await api({
                method: 'DELETE',
                url: '/api/users/auth/delete',
                data: { email: data.email }
            });
            
            if (deleted.status === 200) {
                setAlert({ 
                    message: `${deleted?.data?.message} Redirecting to login page.`, 
                    status: deleted?.status 
                });
                setTimeout(async () => {
                    await api.post('/api/users/auth/logout', {});
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            const message = error?.response?.data?.message || 'Ada kesalahan dalam menghapus akun.';
            const status = error?.response?.status || 500;
            setAlert({ message, status });
        }
    };

    // Loading dan error state
    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading data</div>;

    // 4) Menu user via helper
    const userMenu = buildUserMenu(navigate);
    return (
        <div className='bg-base-200 min-h-screen'>
            {/* Alert notifikasi di pojok kanan atas */}
            <div className="fixed top-4 right-4 z-50">
                {Alert(alert.message, alert.status)}
            </div>
            
            <Drawer title={`Setting - ${data?.email || 'User'}`} lists={userMenu}>
                <div className='m-5 flex justify-center'>
                    <Card title={`${userdata?.full_name} - (${userdata?.id || 'User'}) - (${userdata?.role})`} width='w-11/12'>
                        <div className='divider'></div>
                        
                        {/* Informasi profil user */}
                        <div className='flex gap-10 mb-5'>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Nama Lengkap</h2>
                                <p className='mt-2'>{userdata?.full_name}</p>
                            </div>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Email</h2>
                                <p className='mt-2'>{userdata?.email}</p>
                            </div>
                        </div>
                        
                        <div className='flex gap-10 mb-5'>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Password</h2>
                                <p className='mt-2'>{'*'.repeat(userdata?.password_hash.length)}</p>
                            </div>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Nomor Handphone</h2>
                                <p className='mt-2'>{userdata?.phone}</p>
                            </div>
                        </div>
                        
                        <div className='flex gap-10 mb-5'>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Dibuat Pada</h2>
                                <p className='mt-2'>{new Date(userdata?.created_at).toLocaleString('id-ID')}</p>
                            </div>
                            <div className='text-base w-1/2'>
                                <h2 className='text-2xl font-bold'>Diubah Pada</h2>
                                <p className='mt-2'>{new Date(userdata?.updated_at).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        
                        {/* Tombol aksi */}
                        <div className="card-actions justify-end">
                            <button 
                                className="btn btn-soft hover:btn-primary" 
                                onClick={() => document.getElementById('edit-modal').showModal()}>
                                Ganti Password
                            </button>
                            <button 
                                className="btn btn-soft hover:btn-error" 
                                onClick={() => document.getElementById('delete-modal').showModal()}>
                                Hapus Akun
                            </button>
                        </div>
                    </Card>
                </div>
                
                {/* Modal ganti password */}
                <EditModal>
                    <form onSubmit={editForm.handleSubmit(editSubmit)}>
                        <div className='flex justify-center gap-10'>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-xl">Masukan Password Lama</legend>
                                <input 
                                    type="password" 
                                    {...editForm.register('old_password')}
                                    placeholder="Password Lama" 
                                    className='input'
                                    required 
                                />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend text-xl">Masukan Password Baru</legend>
                                <input 
                                    type="password" 
                                    {...editForm.register('new_password')}
                                    placeholder="Password Baru" 
                                    className='input'
                                    required 
                                />
                            </fieldset>
                        </div>
                        <div className='flex justify-end mt-10'>
                            <button type='submit' className='btn btn-soft hover:btn-primary'>
                                Ganti Password
                            </button>
                        </div>
                    </form>
                </EditModal>
                
                {/* Modal hapus akun */}
                <DeleteModal>
                    <form onSubmit={deleteForm.handleSubmit(deleteSubmit)}>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-xl">Masukan Email untuk Konfirmasi</legend>
                            <input 
                                type="email" 
                                {...deleteForm.register('email')}
                                placeholder="email@email.site" 
                                className='input'
                                required 
                            />
                        </fieldset>
                        <div className='flex justify-end mt-10'>
                            <button type='submit' className='btn btn-soft hover:btn-error'>
                                Hapus Akun
                            </button>
                        </div>
                    </form>
                </DeleteModal>
            </Drawer>
        </div>
    );
}
