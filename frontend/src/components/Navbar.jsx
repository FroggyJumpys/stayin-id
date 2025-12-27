import { Link } from 'react-router-dom';
import { Auth } from '../features/auth/helpers/Auth';
import api from '../utils/api';
import profileIcon from '../assets/profile-round-1342-svgrepo-com.svg';

export default function Navbar() {
    const { user, isLoading } = Auth();

    const handleLogout = async () => {
        try {
            await api.post('/api/users/auth/logout', {});
            // Refresh halaman untuk clear state SWR
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            // Tetap redirect meskipun error
            window.location.href = '/';
        }
    };

    // Dashboard route berdasarkan role
    const getDashboardRoute = () => {
        if (!user) return '/';
        if (user.role === 'admin') return '/admin';
        if (user.role === 'guest') return '/user';
        return '/';
    };

    return (
        <>
            <div className="navbar bg-base-100 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                        </div>
                        <ul
                            tabIndex="-1"
                            className="menu dropdown-content bg-base-100 rounded-box gap-1 z-1 mt-3 w-60 p-5 shadow text-lg">
                            <Link to='/' className='text-base'>HOME</Link>
                            <Link to='/rooms' className='text-base'>KAMAR</Link>
                            <Link to='/service' className='text-base'>SERVICE</Link>
                            <Link to='/' className='text-base'>ABOUT</Link>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <button className="btn btn-ghost w-30 hover:bg-base-100 shadow-none border-none">
                        <Link to='/'>
                            <img src="/images/stayin-logo.png" alt="Logo stayin" className="w-40" />
                        </Link>
                    </button>
                </div>
                <div className="navbar-end">
                    <div className='dropdown dropdown-end'>
                        <div tabIndex={0} role='button' className='btn btn-ghost btn-circle hover:bg-base-100 shadow-none border-none'>
                            <img src={profileIcon} alt="Profil" />
                        </div>
                        <ul
                            tabIndex="-1"
                            className="menu dropdown-content bg-base-100 rounded-box gap-1 z-1 mt-3 w-60 p-5 shadow text-lg">
                            {!isLoading && user ? (
                                <>
                                    <li className='text-base font-semibold px-4 py-2 text-primary'>
                                        {user.full_name || user.email}
                                    </li>
                                    <Link to={getDashboardRoute()} className='text-base'>Dashboard</Link>
                                    <button onClick={handleLogout} className='text-base text-left'>Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to='/login' className='text-base'>Login</Link>
                                    <Link to='/register' className='text-base'>Register</Link>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}