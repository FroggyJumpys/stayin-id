import profileIcon from '../assets/profile-round-1342-svgrepo-com.svg';

export default function Navbar() {
    return (
        <>
            <div className="navbar bg-gray-200 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                        </div>
                        <ul
                            tabIndex="-1"
                            className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-60 p-5 shadow text-lg">
                            <li className='text-base'><a>Homepage</a></li>
                            <li className='text-base'><a>Portfolio</a></li>
                            <li className='text-base'><a>About</a></li>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <button className="btn btn-ghost w-30 hover:bg-base-100 shadow-none border-none">
                        <img src="/images/stayin-logo.png" alt="Logo stayin" className="w-40" />
                    </button>
                </div>
                <div className="navbar-end">
                    <button className="btn btn-ghost btn-circle hover:bg-base-100 shadow-none border-none">
                        <img src={profileIcon} alt="Profil" />
                    </button>
                </div>
            </div>
        </>
    )
}