// Pemakaian: const menuItems = buildStaffMenu(navigate);

import homeIcon from '../../assets/home.svg';
import kamarIcon from '../../assets/door-closed.svg';
import serviceIcon from '../../assets/room-service.svg';
import exitIcon from '../../assets/leave.svg';

export function buildStaffMenu(navigate) {
    return [
        { title: 'Home', icon: homeIcon, onClick: () => navigate('/staff') },
        { title: 'Kelola Booking', icon: kamarIcon, onClick: () => navigate('/staff/bookings') },
        { title: 'Kelola Pesanan', icon: serviceIcon, onClick: () => navigate('/staff/orders') },
        { title: 'Exit', icon: exitIcon, onClick: () => navigate('/') }
    ];
};
