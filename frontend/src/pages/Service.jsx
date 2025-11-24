import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useGSAP } from "@gsap/react";
import SlideRight from "../utils/animation/SlideRight";
import SlideLeft from "../utils/animation/SlideLeft";

export default function Service() {

    useGSAP(() => {
        SlideRight('#go-right-card', { duration: 1.5, delay: 0.10, xFrom: -200, start: 'top 60%'  });
        SlideLeft('#go-left-card', { duration: 1.5, delay: 0.15, xFrom: 200, start: 'top 60%' });
    }, []);

    return (
        <>
            <div className="bg-base-200">
                <Navbar />

                <section className="container">
                    
                    <div id="go-right-card" className="flex justify-start m-5">
                        <div className="card card-side bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <figure className="w-1/2 h-64">
                                <img
                                src="/images/room-service.jpeg"
                                alt="Room Service" 
                                className="object-cover w-full h-full"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title font-bold">Room Service</h2>
                                <p className="text-base">Rasakan kenyamanan tanpa batas! Nikmati hidangan favorit Anda langsung di kamar dengan layanan Room Service kami yang siap 24 jam.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Pesan</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="go-left-card" className="flex justify-end m-5">
                        <div className="card card-side bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Sarapan Gratis</h2>
                                <p className="text-base">Mulai pagi Anda dengan senyum! Sarapan gratis dengan pilihan menu lezat dan bergizi menanti setiap tamu.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Pesan</button>
                                </div>
                            </div>
                            <figure className="w-1/2 h-64">
                                <img
                                src="/images/sarapan-gratis.jpeg"
                                alt="Sarapan Gratis" 
                                className="object-cover w-full h-full"/>
                            </figure>
                        </div>
                    </div>

                    <div id="go-right-card" className="flex justify-start m-5">
                        <div className="card card-side bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <figure className="w-1/2 h-64">
                                <img
                                src="/images/gym-facility.jpg"
                                alt="Gym" 
                                className="object-cover w-full h-full"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title font-bold">Gym</h2>
                                <p className="text-base">Jaga tubuh tetap bugar selama perjalanan! Fasilitas gym modern kami siap mendukung rutinitas olahraga Anda.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Pesan</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="go-left-card" className="flex justify-end m-5">
                        <div className="card card-side bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Spa</h2>
                                <p className="text-base">Relaksasi sempurna menanti Anda. Manjakan diri dengan layanan spa eksklusif yang menenangkan pikiran dan tubuh.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Pesan</button>
                                </div>
                            </div>
                            <figure className="w-1/2 h-64">
                                <img
                                src="/images/spa-service.jpeg"
                                alt="Spa" 
                                className="object-cover w-full h-full"/>
                            </figure>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    )
}