export default function MainCard() {
    return (
<main className='container my-10 bg-base-100'>
                <div className='flex justify-center content-center'>
                    <div id='mainline-card' className='card border-base-100 w-96 card-xl opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center md:items-baseline md:text-justify'>
                            <h2 className='card-title text-4xl p-4'>Nyaman terasa, aman terjamin</h2>
                            <p className='text-base'>Tinggal di kamar nyaman dengan lingkungan aman, hotel kami hadir untuk ketenangan Anda.</p>
                        </div>
                    </div>
                </div>
                <div className='flex justify-center flex-col md:flex-row md:justify-start md:mx-10 mx-0 py-10 gap-5'>
                    <div id='staff-card' className='card bg-base-100 w-full md:w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Staff Ramah dan Cekatan</h3>
                            <p>Dilayani staff ramah dan cekatan, setiap kebutuhan Anda terpenuhi dengan senyum. Urusan menjadi gampang.</p>
                        </div>
                    </div>
                    <div id='kamar-card' className='card bg-base-100 w-full md:w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center justify-center content-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Kamar Nyaman dan Bersih</h3>
                            <p>Nikmati kamar nyaman nan bersih, istirahat tenang untuk energi baru. Lepaskan jiwamu tuk terlahir kembali.</p>
                        </div>
                    </div>
                    <div id='service-card' className='card bg-base-100 w-full md:w-96 card-lg opacity-0 translate-y-10'>
                        <div className='card-body items-center justify-center text-center md:items-baseline md:text-justify'>
                            <h3 className='card-title'>Service Spektakuler</h3>
                            <p>Rasakan service spektakuler yang memanjakan, pengalaman menginap jadi tak terlupakan.</p>
                        </div>
                    </div>
                </div>
            </main>
    )
}