import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Loading from "../../../components/Loading";
import RoomCard from "../components/RoomCard";
import RoomDetailModel from "../components/RoomDetailModel";
import RoomBuyModel from "../components/RoomBuyModel";

import { Auth } from "../../auth/helpers/Auth";

export default function Rooms() {
    const { isLoading } =  Auth();

    const img = [
        { path: '/images/standar-room.jpg', alt: 'Standar' },
        { path: '/images/double-room.jpg', alt: 'Double' },
        { path: '/images/exclusive-room.jpg', alt: 'Exclusive' },
        { path: '/images/suite-room.jpg', alt: 'Suite' }
    ];

    const room = [
        {
            title: 'Kamar - Standar',
            details: [
                'Single bed, no smoking, non-refundable.',
                'Termasuk sarapan'
            ],
            max: 'Maksimal 1 orang dewasa.',
            facility: ['Wi-fi', 'AC'],
            price: 'Rp 300.000 / malam'
        },
        {
            title: 'Kamar - Double',
            details: [
                'Double bed, no smoking, non-refundable.',
                'Termasuk sarapan',
            ],
            max: 'Maksimal 2 orang dewasa.',
            facility: ['Wi-fi', 'AC', 'Meja Kerja', 'TV'],
            price: 'Rp 500.000 / malam'
        },
        {
            title: 'Kamar - Exclusive',
            details: [
                'King bed, no smoking, non-refundable.',
                'Termasuk sarapan serta akses kolam renang & gym.',
                'Pemandangan kota atau taman.'
            ],
            facility: ['Wi-fi', 'AC', 'Balkon', 'Minibar', 'Smart TV', 'Bathtub'],
            max: 'Maksimal 5 orang dewasa.',
            price: 'Rp 1.100.000 / malam'
        },
        {
            title: 'Kamar - Suite',
            details: [
                'Super king bed, no smoking, non-refundable.',
                'Ruang tamu & makan terpisah, jacuzzi, city light view.',
                'Pemandangan city light yang indah di malam hari.'
            ],
            facility: ['Wi-fi', 'AC', 'Ruang Tamu', 'Jacuzzi', 'Minibar', 'Smart TV', 'Bathtub'],
            max: 'Maks. 8 dewasa.',
            price: 'Rp 2.000.000 / malam'
        }
    ]

    if (isLoading) return <Loading />;

    return (
        <>
            <div className="bg-base-200">
                <Navbar />

                <section className="container my-10 bg-neutral text-neutral-content">
                    <div className="text-4xl font-bold text-center">
                        <h1 className="py-5">Pilih Kamar</h1>
                    </div>
                    <div className="flex justify-center content-center gap-6">
                        <RoomCard detailId='modal-standar' pesanId='modal-pesan' img={img[0]} title='Kamar - Standar' paragraph='Single bed, no smoking, non-refundable. Maksimal 1 orang dewasa.' />
                        <RoomCard detailId='modal-double' pesanId='modal-pesan' img={img[1]} title='Kamar - Double' paragraph='Double bed, no smoking, non-refundable. Maksimal 2 orang dewasa.' />
                    </div>

                    <div className="flex justify-center content-center gap-6">
                        <RoomCard detailId='modal-exclusive' pesanId='modal-pesan' img={img[2]} title='Kamar - Exclusive' paragraph='King bed, no smoking, non-refundable. Balkon, minibar, smart TV, bathtub. Maksimal 5 orang dewasa.' />
                        <RoomCard detailId='modal-suite' pesanId='modal-pesan' img={img[3]} title='Kamar - Suite' paragraph='Super king bed, no smoking. Ruang tamu & makan terpisah, jacuzzi, city light view. Maks. 8 dewasa.' />
                    </div>
                </section>

                <RoomDetailModel id='modal-standar' img={img[0]} room={room[0]}/>
                <RoomDetailModel id='modal-double' img={img[1]} room={room[1]}/>
                <RoomDetailModel id='modal-exclusive' img={img[2]} room={room[2]}/>
                <RoomDetailModel id='modal-suite' img={img[3]} room={room[3]}/>

                <RoomBuyModel id='modal-pesan' />

                <Footer />
            </div>
        </>
    )
}
