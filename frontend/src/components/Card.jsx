export function Card({ children, title }) {
    return (
        <>
            <div className="card bg-base-100 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{title}</h2>
                    {children}
                </div>
            </div>
        </>
    )
};

export function CardWithButton({ children, title, buttonTitle, onClick }) {
    return (
        <>
            <div className="card bg-base-100 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{title}</h2>
                    {children}
                    <div className="card-actions justify-end">
                        <button className="btn btn-primary" onClick={onClick}>{buttonTitle}</button>
                    </div>
                </div>
            </div>
        </>
    )
}