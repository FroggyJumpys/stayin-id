export default function Hero() {
    return (
        <>
            <div
                className="hero min-h-screen "
                style={{
                    backgroundImage:
                    "url(/images/blue-hotel.jpeg)",
                }}
                >
                <div className="hero-overlay"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                    <h1 className="mb-5 text-5xl font-bold">Stay In Hotel</h1>
                    <p className="mb-5">
                        Pilihan terbaik untuk berlibur.
                    </p>
                    <button className="btn btn-primary">Get Started</button>
                    </div>
                </div>
            </div>
        </>
    )
}