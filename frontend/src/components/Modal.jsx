const DeleteModal = ({ children }) => {
    return (
        <>
            <dialog id="delete-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-2xl font-bold">Delete Form</h3>
                    <div className="divider"></div>
                    {children}
                </div>
            </dialog>
        </>
    )
}

const EditModal = ({ children }) => {
    return (
        <>
            <dialog id="edit-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-2xl font-bold">Edit Form</h3>
                    <div className="divider"></div>
                    {children}
                </div>
            </dialog>
        </>
    )
}

const CreateModal = ({ children }) => {
    return (
        <>
            <dialog id="create-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="text-2xl font-bold">Create Form</h3>
                    <div className="divider"></div>
                    {children}
                </div>
            </dialog>
        </>
    )
}

const CostumeModal = ({ children, title }) => {
    return (
        <>
            <dialog id="create-modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"></button>
                    </form>
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <div className="divider"></div>
                    {children}
                </div>
            </dialog>
        </>
    )
}

export { DeleteModal, EditModal, CreateModal };