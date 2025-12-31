// Halaman About - Informasi tentang Hotel Stay In
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export default function About() {
    const misiList = [
        'Memberikan pelayanan yang profesional, ramah, dan responsif kepada seluruh tamu.',
        'Menyediakan fasilitas lengkap dan berkualitas tinggi untuk mendukung kenyamanan dan kebutuhan tamu.',
        'Mengutamakan kebersihan, kenyamanan, dan keamanan sesuai standar industri perhotelan.',
        'Membangun tim kerja yang kompeten, disiplin, dan berorientasi pada pelayanan.',
        'Mengembangkan inovasi dan teknologi untuk meningkatkan efisiensi dan kualitas layanan.',
        'Mendukung perkembangan pariwisata lokal melalui promosi budaya dan potensi daerah.',
        'Menerapkan praktik berkelanjutan demi menjaga lingkungan dan menciptakan operasional hotel yang ramah lingkungan.'
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            
            <main className="flex bg-base-100">
                {/* Hero Section */}
                <div className="bg-base-200 text-primary-content py-16 border-1 border-base-300">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Kami</h1>
                        <p className="text-lg opacity-90">Comfort & Modern Living</p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12 max-w-4xl">
                    {/* Latar Belakang */}
                    <section className="card bg-base-100 shadow-sm mb-8">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Latar Belakang</h2>
                            <p className="text-base-content/80 leading-relaxed mb-4">
                                Hotel <strong>Stay In</strong> didirikan untuk memenuhi kebutuhan akomodasi modern 
                                yang terus berkembang sebagai pusat kegiatan bisnis dan pariwisata. Seiring meningkatnya 
                                mobilitas masyarakat, baik wisatawan maupun pelaku bisnis membutuhkan tempat menginap 
                                yang nyaman, aman, dan memiliki pelayanan berkualitas.
                            </p>
                            <p className="text-base-content/80 leading-relaxed mb-4">
                                Hadir dengan konsep <strong>"Comfort & Modern Living"</strong>, Hotel Stay In berupaya 
                                memberikan pengalaman menginap yang hangat dan berkesan bagi setiap tamu. Dengan desain 
                                interior yang elegan, fasilitas lengkap, serta pelayanan ramah dari staf profesional, 
                                Hotel Stay In menjadi pilihan ideal bagi tamu yang menginginkan kenyamanan seperti di 
                                rumah namun tetap mendukung produktivitas perjalanan.
                            </p>
                            <p className="text-base-content/80 leading-relaxed">
                                Hotel Stay In berkomitmen untuk terus meningkatkan kualitas layanan dan menciptakan 
                                standar baru dalam industri perhotelan lokal, sehingga mampu bersaing di era modern 
                                yang semakin kompetitif.
                            </p>
                        </div>
                    </section>

                    {/* Visi */}
                    <section className="card bg-base-100 shadow-sm mb-8">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Visi</h2>
                            <blockquote className="border-l-4 border-primary pl-4 italic text-lg text-base-content/90">
                                "Menjadi hotel pilihan utama yang memberikan kenyamanan modern dan pelayanan 
                                terbaik bagi setiap tamu."
                            </blockquote>
                        </div>
                    </section>

                    {/* Misi */}
                    <section className="card bg-base-100 shadow-sm mb-8">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Misi</h2>
                            <ul className="space-y-3">
                                {misiList.map((misi, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <span className="badge mt-1">{index + 1}</span>
                                        <span className="text-base-content/80">{misi}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
