import Drawer from '../../components/Drawer';
import homeIcon from '../../assets/home.svg';
import settingIcon from '../../assets/settings.svg';
import userIcon from '../../assets/user.svg';
import starIcon from '../../assets/star.svg';
import chartIcon from '../../assets/chart.svg';
import Stat from '../../components/Stat';

export default function Admin() {
    const menuItems = [
        { title: 'Home', icon: homeIcon},
        { title: 'Sales and Orders Analytics', icon: chartIcon},
        { title: 'User Analytics', icon: userIcon},
        { title: 'Rating Analytics', icon: starIcon},
        { title: 'Setting', icon: settingIcon}
    ];

    const statsData = [
        {
            title: 'Total User',
            value: '25.6K',
            desc: '21% more than last month',
            figure: userIcon,        // or a React node (e.g., <svg .../>)
            figureTint: 'text-primary',         // optional tint classes
            valueTint: 'text-primary',
        },
        {
            title: 'Total Room Ordered',
            value: '25.6K',
            desc: '21% more than last month',
            figure: userIcon,        // or a React node (e.g., <svg .../>)
            figureTint: 'text-primary',         // optional tint classes
            valueTint: 'text-primary',
        },
        {
            title: 'Total Service Ordered',
            value: '25.6K',
            desc: '21% more than last month',
            figure: userIcon,        // or a React node (e.g., <svg .../>)
            figureTint: 'text-primary',         // optional tint classes
            valueTint: 'text-primary',
        }
    ]

    return (
        <>
            <div className='bg-base-200'>
                <Drawer title='HOME' lists={menuItems}>
                    <div className='m-5'>
                        <Stat stats={statsData} />
                    </div>
                </Drawer>
            </div>
        </>
    )
}