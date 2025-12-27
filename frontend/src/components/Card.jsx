export function Card({ children, title, width = 'w-96'}) {
    return (
        <>
            <div className={`card bg-base-100 ${width}  shadow-sm`}>
                <div className="card-body">
                    <h2 className="card-title">{title}</h2>
                    {children}
                </div>
            </div>
        </>
    )
};

export function CardWithButton({ children, title, buttonTitle, onClick, withButton = true }) {
    return (
        <>
            <div className="card bg-base-100 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{title}</h2>
                    {children}
                    {withButton && 
                        <div className="card-actions justify-end">
                            <button className="btn btn-primary" onClick={onClick}>{buttonTitle}</button>
                        </div>
                    }
                </div>
            </div>
        </>
    )
}