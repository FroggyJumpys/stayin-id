import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function Rooms() {
    return (
        <>
            <div className="bg-base-200">
                <Navbar />

                <section className="container my-10 bg-neutral text-neutral-content">
                    <div className="text-4xl font-bold text-center">
                        <h1 className="py-5">Pilih Kamar</h1>
                    </div>

                    <div className="flex">

                        <div className="card lg:card-side w-1/2 m-5 bg-base-100 text-base-content shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                            <figure>
                                <img
                                src="/images/standar-room.jpg"
                                alt="Standar" 
                                className="object-cover"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">Kamar - Standar</h2>
                                <p>Single bed, no smoking, non-refundable. Maksimal 1 orang dewasa.</p>
                                <ul className="flex flex-col md:flex-row gap-1.5 w-auto mb-20">
                                    <li className="badge badge-soft">Wi-fi</li>
                                    <li className="badge badge-soft">AC</li>
                                </ul>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-soft w-1/2">Lihat Detail</button>
                                    <button className="btn btn-primary w-1/2">Pesan</button>
                                </div>
                            </div>
                        </div>

                        <div className="card lg:card-side w-1/2 m-5 bg-base-100 text-base-content shadow-sm transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                            <figure>
                                <img
                                src="/images/double-room.jpg"
                                alt="Double" 
                                className="object-cover"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">Kamar - Double</h2>
                                <p>Double bed, no smoking, non-refundable. Maksimal 2 orang dewasa.</p>
                                <ul className="flex flex-col md:flex-row gap-1.5 w-auto mb-20">
                                    <li className="badge badge-soft">Wi-fi</li>
                                    <li className="badge badge-soft">AC</li>
                                    <li className="badge badge-soft">Meja Kerja</li>
                                </ul>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-soft w-1/2">Lihat Detail</button>
                                    <button className="btn btn-primary w-1/2">Pesan</button>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex">

                        <div className="card lg:card-side w-1/2 m-5 bg-base-100 text-base-content shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                            <figure>
                                <img
                                src="/images/exclusive-room.jpg"
                                alt="Album" 
                                className="object-cover"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">Kamar - Exclusive</h2>
                                <p>
                                    King bed, no smoking, non-refundable. Balkon, minibar, 
                                    smart TV, bathtub. Maksimal 5 orang dewasa.    
                                </p>
                                <ul className="flex flex-col md:flex-row gap-1.5 w-auto mb-20">
                                    <li className="badge badge-soft h-fit">Kolam Renang</li>
                                    <li className="badge badge-soft">Gym</li>
                                    <li className="badge badge-soft">Balkon</li>
                                    <li className="badge badge-soft">Minibar</li>
                                </ul>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-soft w-1/2">Lihat Detail</button>
                                    <button className="btn btn-primary w-1/2">Pesan</button>
                                </div>
                            </div>
                        </div>

                        <div className="card lg:card-side w-1/2 m-5 bg-base-100 text-base-content shadow-sm transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                            <figure>
                                <img
                                src="/images/suite-room.jpg"
                                alt="Album" 
                                className="object-cover"/>
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">Kamar - Suite</h2>
                                <p>
                                    Super king bed, no smoking. Ruang tamu & makan terpisah, jacuzzi, city light view. Maks. 8 dewasa.
                                </p>
                                <ul className="flex flex-col md:flex-row gap-1.5 w-auto mb-20">
                                    <li className="badge badge-soft h-fit">Sarapan Premium</li>
                                    <li className="badge badge-soft h-fit">Minibar Exclusive</li>
                                </ul>
                                <div className="card-actions justify-end">
                                    <button className="btn btn-soft w-1/2">Lihat Detail</button>
                                    <button className="btn btn-primary w-1/2">Pesan</button>
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