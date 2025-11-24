import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Animasi slide dari kiri ke kanan dengan scroll trigger menggunakan GSAP
 * Element akan slide masuk dari luar frame kiri ke posisi normalnya
 * 
 * @param {string} selector - CSS selector untuk target element (#id atau .class)
 * @param {Object} [options] - Konfigurasi opsional untuk animasi
 * @param {string} [options.start='top 80%'] - Posisi viewport untuk memulai animasi
 * @param {number} [options.duration=1] - Durasi animasi dalam detik
 * @param {number} [options.delay=0] - Delay sebelum animasi dimulai dalam detik
 * @param {number} [options.xFrom=-100] - Jarak awal dari kiri (dalam pixel, negatif = dari kiri)
 * @param {boolean} [options.once=true] - Apakah animasi hanya dijalankan sekali
 * 
 * @example
 * // Basic usage - slide dari kiri 100px
 * SlideRight('#myElement');
 * 
 * @example
 * // Dengan custom options - slide dari kiri 200px dengan delay
 * SlideRight('.card', { duration: 1.5, delay: 0.3, xFrom: -200 });
 */
export default function SlideRight(selector, options = {}) {
    if (!registered) {
        gsap.registerPlugin(ScrollTrigger);
        registered = true;
    }

    const {
        start = 'top 80%',
        duration = 1,
        delay = 0,
        xFrom = -100,
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