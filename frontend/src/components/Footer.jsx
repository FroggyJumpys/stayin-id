import { Link } from "react-router-dom";

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
                <Link to='/rooms' className="link link-hover">Kamar</Link>
                <Link to='/service' className="link link-hover">Service</Link>
            </nav>
            <nav>
                <h6 className="footer-title">Company</h6>
                <Link to='/' className="link link-hover">About Us</Link>
            </nav>
        </footer>
        </>
    )
}