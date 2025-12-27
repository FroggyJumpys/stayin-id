import { Link } from 'react-router-dom';

export default function SectionCard() {
    return (
        <section className='container my-10 bg-base-100'>
            <div className='flex flex-col md:flex-row min-h-screen'>
                <figure id='image-card'>
                    <img src="/images/facility.jpeg" alt="Fasilitas" className='h-1/2 md:h-screen object-cover'/>
                </figure>
                <div id='lengkap-card' className="card m-0 bg-base-100 w-fit shadow-sm text-justify opacity-0 translate-y-10">
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
                            <Link to='/service'>Selengkapnya</Link>
                        </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}