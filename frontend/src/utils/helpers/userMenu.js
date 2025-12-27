// Pemakaian: const menuItems = buildAdminMenu(navigate);

import homeIcon from '../../assets/home.svg';
import settingIcon from '../../assets/settings.svg';
import starIcon from '../../assets/star.svg';
import kamarIcon from '../../assets/door-closed.svg';
import serviceIcon from '../../assets/room-service.svg';
import exitIcon from '../../assets/leave.svg';

export function buildUserMenu(navigate) {
    return [
        { title: 'Home', icon: homeIcon, onClick: () => navigate('/user') },
        { title: 'Booking', icon: kamarIcon, onClick: () => navigate('') },
        { title: 'Services', icon: serviceIcon, onClick: () => navigate('') },
        { title: 'Rating', icon: starIcon, onClick: () => navigate('') },
        { title: 'Setting', icon: settingIcon, onClick: () => navigate('/user/setting') },
        { title: 'Exit', icon: exitIcon, onClick: () => navigate('/') }
    ];
};