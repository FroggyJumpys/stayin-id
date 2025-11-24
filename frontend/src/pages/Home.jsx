import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FadeIn from '../utils/animation/FadeIn';
import FadeOut from '../utils/animation/FadeOut';
import SlideRight from '../utils/animation/SlideRight';
import { Link } from 'react-router-dom';

gsap.registerPlugin(useGSAP, ScrollTrigger);



export default function Home() {
    useGSAP(() => {
        FadeIn('#mainline-card');
        FadeIn('#staff-card', { delay: 0.15 });
        FadeIn('#kamar-card', { delay: 0.15 });
        FadeIn('#service-card', { delay: 0.15 });
        FadeIn('#lengkap-card', { delay: 1 });
                
        SlideRight('#image-card', { duration: 1.5, delay: 0.3, xFrom: -200});

    }, []);

    return (
        <>
        <div className='bg-base-200'>
            <Navbar />

            <Hero />

            <main className='container my-10 bg-base-100'>
                <div className='flex justify-center content-center'>
                    <div id='mainline-card' className='card border-base-100 w-96 card-xl opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center'>
                            <h2 className='card-title text-4xl p-4'>Nyaman terasa, aman terjamin</h2>
                            <p className='text-base'>Tinggal di kamar nyaman dengan lingkungan aman, hotel kami hadir untuk ketenangan Anda.</p>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center flex-col md:flex-row md:justify-start mx-10 py-10 gap-5'>
                    <div id='staff-card' className='card bg-base-100 w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Staff Ramah dan Cekatan</h3>
                            <p>Dilayani staff ramah dan cekatan, setiap kebutuhan Anda terpenuhi dengan senyum. Urusan menjadi gampang.</p>
                        </div>
                    </div>
                    <div id='kamar-card' className='card bg-base-100 w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Kamar Nyaman dan Bersih</h3>
                            <p>Nikmati kamar nyaman nan bersih, istirahat tenang untuk energi baru. Lepaskan jiwamu tuk terlahir kembali.</p>
                        </div>
                    </div>
                    <div id='service-card' className='card bg-base-100 w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Service Spektakuler</h3>
                            <p>Rasakan service spektakuler yang memanjakan, pengalaman menginap jadi tak terlupakan.</p>
                        </div>
                    </div>
                </div>
            </main>

            <section className='container my-10 bg-base-100'>
                <div className='flex flex-col md:flex-row min-h-screen'>
                    <figure id='image-card'>
                        <img src="/images/facility.jpeg" alt="Fasilitas" className='h-1/2 md:h-screen object-cover'/>
                    </figure>
                    <div id='lengkap-card' className="card bg-base-100 w-fit shadow-sm text-justify opacity-0 translate-y-10">
                        <div className="card-body">
                            <h2 className="card-title text-2xl">Kamar</h2>
                            <p className='text-base'>
                                Nikmati kenyamanan kamar yang dirancang khusus untuk memberi pengalaman 
                                istirahat terbaik. Dengan desain modern, kebersihan terjaga, serta fasilitas 
                                lengkap, setiap kamar menghadirkan suasana tenang yang membuat Anda betah 
                                berlama-lama. Klik tombol di bawah untuk melihat pilihan kamar yang sesuai 
                                dengan kebutuhan Anda dan rasakan kenyamanan sesungguhnya.
                            </p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-primary">
                                    <Link to='/rooms'>Selengkapnya</Link>
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <h2 className="card-title text-2xl">Service</h2>
                            <p className='text-base'>
                                Kami hadir dengan layanan yang ramah, cepat, dan profesional untuk memastikan 
                                setiap kebutuhan Anda terpenuhi. Mulai dari pelayanan resepsionis, kebersihan, 
                                hingga bantuan khusus, semua dirancang agar Anda merasa dihargai dan 
                                diperhatikan. Klik tombol di bawah untuk mengetahui lebih banyak tentang 
                                service unggulan kami yang akan membuat pengalaman Anda semakin berkesan.
                            </p>
                            <div className="card-actions justify-end">
                            <button className="btn btn-primary">
                                Selengkapnya
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

        </div>
        </>
    )
};