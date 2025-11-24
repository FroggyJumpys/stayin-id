import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Animasi slide dari kanan ke kiri dengan scroll trigger menggunakan GSAP
 * Element akan slide masuk dari luar frame kanan ke posisi normalnya
 * 
 * @param {string} selector - CSS selector untuk target element (#id atau .class)
 * @param {Object} [options] - Konfigurasi opsional untuk animasi
 * @param {string} [options.start='top 80%'] - Posisi viewport untuk memulai animasi
 * @param {number} [options.duration=1] - Durasi animasi dalam detik
 * @param {number} [options.delay=0] - Delay sebelum animasi dimulai dalam detik
 * @param {number} [options.xFrom=100] - Jarak awal dari kanan (dalam pixel, positif = dari kanan)
 * @param {boolean} [options.once=true] - Apakah animasi hanya dijalankan sekali
 * 
 * @example
 * // Basic usage - slide dari kanan 100px
 * SlideLeft('#myElement');
 * 
 * @example
 * // Dengan custom options - slide dari kanan 200px dengan delay
 * SlideLeft('.card', { duration: 1.5, delay: 0.3, xFrom: 200 });
 */
export default function SlideLeft(selector, options = {}) {
    if (!registered) {
        gsap.registerPlugin(ScrollTrigger);
        registered = true;
    }

    const {
        start = 'top 80%',
        duration = 1,
        delay = 0,
        xFrom = 100,
        once = true,
    } = options;

    gsap.fromTo(
        selector,
        { opacity: 0, x: xFrom },
        {
            opacity: 1,
            x: 0,
            duration,
            delay,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: selector,
                start,
                toggleActions: 'play none none none',
                once,
            },
        }
    );
}
