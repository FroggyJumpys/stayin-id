import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Animasi fade in dengan scroll trigger menggunakan GSAP
 * 
 * @param {string} selector - CSS selector untuk target element (#id atau .class)
 * @param {Object} [options] - Konfigurasi opsional untuk animasi
 * @param {string} [options.start='top 80%'] - Posisi viewport untuk memulai animasi
 * @param {number} [options.duration=1] - Durasi animasi dalam detik
 * @param {number} [options.delay=0] - Delay sebelum animasi dimulai dalam detik
 * @param {number} [options.yFrom=40] - Jarak awal dari posisi normal (dalam pixel)
 * @param {boolean} [options.once=true] - Apakah animasi hanya dijalankan sekali
 * 
 * @example
 * // Basic usage
 * FadeIn('#myElement');
 * 
 * @example
 * // Dengan custom options
 * FadeIn('.card', { duration: 2, delay: 0.5, yFrom: 60 });
 */
export default function FadeIn(selector, options = {}) {
    if (!registered) {
        gsap.registerPlugin(ScrollTrigger);
        registered = true;
    }

    const {
        start = 'top 80%',
        duration = 1,
        delay = 0,
        yFrom = 40,
        once = true,
    } = options;

    gsap.fromTo(
        selector,
        { opacity: 0, y: yFrom },
        {
            opacity: 1,
            y: 0,
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