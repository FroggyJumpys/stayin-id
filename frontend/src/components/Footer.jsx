export default function Footer() {
    return (
        <>
        <footer className="footer sm:footer-horizontal bg-base-100 text-base-content p-10">
            <aside>
                <img src="/images/stayin-logo.png" alt="Logo Stayin" className="w-32"/>
                <p>
                Stay In Hotel
                <br />
                Memberikan Kenyaman dan Keamanan Sejak 2025
                </p>
            </aside>
            <nav>
                <h6 className="footer-title">We Offer</h6>
                <a className="link link-hover">Kamar</a>
                <a className="link link-hover">Service</a>
            </nav>
            <nav>
                <h6 className="footer-title">Company</h6>
                <a className="link link-hover">About us</a>
                <a className="link link-hover">Contact</a>
            </nav>
        </footer>
        </>
    )
}