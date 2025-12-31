export default function RoomCard({ img, title, paragraph, detailId, pesanId }) {
    if (!img) return null;

    return (
        <div className="card md:card-side w-1/2 m-5 bg-base-100 text-base-content shadow-sm transition duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
            <figure>
                <img
                src={img.path}
                alt={img.alt} 
                className="object-cover"/>
            </figure>
            <div className="card-body">
                <h2 className="card-title">{title}</h2>
                <p>{paragraph}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-soft w-1/2" onClick={()=>document.getElementById(detailId).showModal()}>Lihat Detail</button>
                    <button className="btn btn-primary w-1/2" onClick={()=>document.getElementById(pesanId).showModal()}>Pesan</button>
                </div>
            </div>
        </div>
    );
};