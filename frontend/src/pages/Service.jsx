import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Service() {
    return (
        <>
            <div className="bg-base-200">
                <Navbar />

                <section className="container">
                    
                    <div className="flex justify-start m-5">
                        <div className="card bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Room Service</h2>
                                <p className="text-base">Rasakan kenyamanan tanpa batas! Nikmati hidangan favorit Anda langsung di kamar dengan layanan Room Service kami yang siap 24 jam.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end m-5">
                        <div className="card bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Sarapan Gratis</h2>
                                <p className="text-base">Mulai pagi Anda dengan senyum! Sarapan gratis dengan pilihan menu lezat dan bergizi menanti setiap tamu.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-start m-5">
                        <div className="card bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Gym</h2>
                                <p className="text-base">Jaga tubuh tetap bugar selama perjalanan! Fasilitas gym modern kami siap mendukung rutinitas olahraga Anda.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end m-5">
                        <div className="card bg-base-100 w-full max-w-2xl shadow-sm transition duration-300 hover:shadow-md">
                            <div className="card-body">
                                <h2 className="card-title font-bold">Spa</h2>
                                <p className="text-base">Relaksasi sempurna menanti Anda. Manjakan diri dengan layanan spa eksklusif yang menenangkan pikiran dan tubuh.</p>
                                <div className="card-actions justify-end">
                                <button className="btn btn-primary">Buy Now</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    )
}