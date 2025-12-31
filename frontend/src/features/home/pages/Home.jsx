import Navbar from '../../../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../../../components/Footer';
import MainCard from '../components/MainCard';
import SectionCard from '../components/SectionCard';
import ReviewSection from '../components/ReviewSection';

import FadeIn from '../../../utils/animation/FadeIn';
import SlideRight from '../../../utils/animation/SlideRight';
import { useGSAP } from '@gsap/react';

export default function Home() {
    useGSAP(() => {
        FadeIn('#mainline-card');
        FadeIn('#staff-card', { delay: 0.15 });
        FadeIn('#kamar-card', { delay: 0.15 });
        FadeIn('#service-card', { delay: 0.15 });
        FadeIn('#lengkap-card', { delay: 1 });
        FadeIn('#review-section', { delay: 0.2 });
                
        SlideRight('#image-card', { duration: 1.5, delay: 0.3, xFrom: -200});

    }, []);

    return (
        <>
        <div className='bg-base-200'>
            <Navbar />

            <Hero />

            <MainCard />

            <SectionCard />

            {/* Review Section */}
            <div id='review-section'>
                <ReviewSection />
            </div>

            <Footer />
        </div>
        </>
    )
};
