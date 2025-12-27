export default function RoomDetailModel({ id, img, room }) {
    if (!img) return null;
    if (!room) return null;
    return (
        <dialog id={id} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box max-w-3xl">
                <h3 className="font-bold text-2xl mb-4">
                    {room.title}
                </h3>

                <div className="flex flex-col md:flex-row">
                    <figure className="mb-6">
                        <img 
                            src={img.path} 
                            alt={img.alt} 
                            className="rounded-lg w-full h-64 object-cover"
                        />
                    </figure>
                    <div className="divider md:divider-horizontal"></div>
                    <div className="flex flex-col">
                        {room.details && room.details.map((detail, index) => (
                            <ul key={index}>
                                <li>{detail}</li>
                            </ul>
                        ))}
                        <p>Fasilitas: {room.facility && room.facility.join(', ')}</p>
                        <span className="font-bold my-4">{room.max}</span>
                        <span className="font-bold my-4">{room.price}</span>
                        <form method="dialog" className="flex justify-end mt-10 gap-4">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-ghost">Mengerti</button>
                        </form>
                    </div>
                </div>
            </div>
        </dialog>
    );
};