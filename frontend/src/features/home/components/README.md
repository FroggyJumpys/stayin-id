# Components Folder

Folder ini digunakan untuk komponen-komponen yang **spesifik** untuk feature home.

## Kapan Taruh Komponen Di Sini?

✅ **Taruh di sini jika:**
- Komponen hanya dipakai di halaman Home
- Contoh: `HomeCard.jsx`, `HomeHero.jsx`, `FeatureCard.jsx`

❌ **JANGAN taruh di sini jika:**
- Komponen dipakai di banyak fitur → taruh di `/src/components/`
- Contoh: Navbar, Footer, Modal (sudah ada di shared)

## Contoh Struktur

```
components/
├── FeatureCard.jsx      # Card untuk menampilkan fitur
├── TestimonialCard.jsx  # Card untuk testimonial
└── index.js             # Export semua components
```
