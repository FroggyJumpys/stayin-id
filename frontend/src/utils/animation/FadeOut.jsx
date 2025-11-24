import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Animasi fade out dengan scroll trigger menggunakan GSAP
 * Element akan fade out (memudar) saat user scroll melewati element
 * 
 * @param {string} selector - CSS selector untuk target element (#id atau .class)
 * @param {Object} [options] - Konfigurasi opsional untuk animasi
 * @param {string} [options.start='top 20%'] - Posisi viewport untuk memulai animasi
 * @param {string} [options.end='top -20%'] - Posisi viewport untuk mengakhiri animasi
 * @param {number} [options.duration=1] - Durasi animasi dalam detik
 * @param {number} [options.yTo=40] - Jarak akhir dari posisi normal (dalam pixel)
 * @param {boolean} [options.scrub=true] - Sync animasi dengan scroll position
 * 
 * @example
 * // Basic usage - fade out saat scroll
 * FadeOut('#myElement');
 * 
 * @example
 * // Dengan custom options
 * FadeOut('.hero-text', { yTo: 60, scrub: 1 });
 */
export default function FadeOut(selector, options = {}) {
    if (!registered) {
        gsap.registerPlugin(ScrollTrigger);
        registered = true;
    }

    const {
        start = 'top 20%',
        end = 'top -20%',
        yTo = 40,
        scrub = true,
    } = options;

    gsap.to(selector, {
        opacity: 0,
        y: yTo,
        ease: 'power2.in',
        scrollTrigger: {
            trigger: selector,
            start,
            end,
            scrub,
        },
    });
}
