// Pemakaian: const menuItems = buildAdminMenu(navigate);

import homeIcon from '../../assets/home.svg';
import userIcon from '../../assets/user.svg';
import starIcon from '../../assets/star.svg';
import kamarIcon from '../../assets/door-closed.svg';
import serviceIcon from '../../assets/room-service.svg';
import exitIcon from '../../assets/leave.svg';

export function buildAdminMenu(navigate) {
    return [
        { title: 'Home', icon: homeIcon, onClick: () => navigate('/admin') },
        { title: 'User', icon: userIcon, onClick: () => navigate('/admin/user') },
        { title: 'Kamar', icon: kamarIcon, onClick: () => navigate('/admin/kamar') },
        { title: 'Service', icon: serviceIcon, onClick: () => navigate('/admin/service') },
        { title: 'Rating', icon: starIcon, onClick: () => navigate('/admin/rating') },
        { title: 'Exit', icon: exitIcon, onClick: () => navigate('/') }
    ];
};