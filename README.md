# 🏨 StayIn ID - Hotel Management System

> ⚠️ **Disclaimer**: Project ini dibuat hanya untuk **tugas kuliah** dan bukan untuk penggunaan komersial.

## 📋 Deskripsi

**StayIn ID** adalah aplikasi web manajemen hotel full-stack yang memungkinkan pengguna untuk melakukan pemesanan kamar, memesan layanan hotel, dan memberikan ulasan. Aplikasi ini dibangun dengan konsep **"Comfort & Modern Living"** yang menawarkan pengalaman menginap digital yang nyaman.

## ✨ Fitur Utama

### 👤 Untuk Tamu (Guest)
- **Autentikasi** - Register, Login, Logout dengan JWT
- **Pemesanan Kamar** - Booking kamar dengan pilihan tanggal check-in/check-out
- **Pemesanan Layanan** - Pesan layanan hotel (Food & Beverage, Laundry, Transport, dll)
- **Pembayaran Online** - Integrasi dengan Midtrans Payment Gateway
- **Review & Rating** - Berikan ulasan dan rating untuk pengalaman menginap
- **Dashboard User** - Lihat riwayat booking, pesanan, dan ulasan

### 👨‍💼 Untuk Staff
- **Kelola Booking** - Konfirmasi atau batalkan pemesanan kamar tamu
- **Kelola Pesanan** - Update status pesanan layanan

### 🔐 Untuk Admin
- **Manajemen User** - CRUD data pengguna
- **Manajemen Kamar** - CRUD data kamar hotel
- **Manajemen Layanan** - CRUD data layanan hotel
- **Manajemen Rating** - Lihat dan kelola ulasan tamu

## 🛠️ Tech Stack

### Frontend
| Teknologi | Deskripsi |
|-----------|-----------|
| React 19 | Library UI |
| Vite | Build tool |
| React Router DOM | Routing |
| Tailwind CSS + DaisyUI | Styling |
| SWR | Data fetching & caching |
| React Hook Form | Form handling |
| GSAP | Animasi |
| Chart.js | Grafik statistik |
| Axios | HTTP client |

### Backend
| Teknologi | Deskripsi |
|-----------|-----------|
| Express.js 5 | Web framework |
| PostgreSQL | Database |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Midtrans | Payment gateway |
| Helmet | Security headers |
| Morgan | HTTP logging |

## 📁 Struktur Project

```
stayin-id/
├── backend/
│   └── src/
│       ├── server.js          # Entry point
│       ├── database/
│       │   ├── db.js          # Database connection
│       │   ├── database.sql   # SQL schema
│       │   └── queries/       # Query handlers
│       ├── middlewares/
│       │   └── authorize.js   # JWT & role authorization
│       └── router/            # API routes
│
└── frontend/
    └── src/
        ├── App.jsx            # Main app & routing
        ├── components/        # Reusable components
        ├── features/          # Feature-based modules
        │   ├── about/         # Halaman About
        │   ├── auth/          # Login, Register, Protected
        │   ├── dashboard/     # Admin, Staff, User dashboards
        │   ├── home/          # Homepage
        │   ├── rooms/         # Halaman Kamar
        │   └── services/      # Halaman Layanan
        └── utils/             # Helpers & utilities
```

## 🗄️ Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna (guest, staff, admin) |
| `rooms` | Data kamar hotel |
| `bookings` | Pemesanan kamar |
| `payments` | Data pembayaran (Midtrans) |
| `services` | Data layanan hotel |
| `service_orders` | Pemesanan layanan |
| `reviews` | Ulasan & rating tamu |

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js v18+
- PostgreSQL
- Midtrans Account (Sandbox)

### Backend
```bash
cd backend
npm install
# Buat file .env dengan konfigurasi database & Midtrans
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=stayin_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
MT_SERVER_KEY=your_midtrans_server_key
MT_CLIENT_KEY=your_midtrans_client_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

## 📝 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/users/auth/register` | Register user baru |
| POST | `/api/users/auth/login` | Login user |
| POST | `/api/users/auth/logout` | Logout user |
| GET | `/api/users/auth/me` | Get current user |
| GET | `/api/rooms` | Get semua kamar |
| POST | `/api/bookings` | Buat booking baru |
| GET | `/api/services` | Get semua layanan |
| POST | `/api/orders` | Buat pesanan layanan |
| GET | `/api/reviews` | Get semua review |
| POST | `/api/reviews` | Buat review baru |

## 👥 Role & Permissions

| Role | Akses |
|------|-------|
| `guest` | Booking kamar, pesan layanan, beri review |
| `staff` | Kelola status booking & pesanan |
| `admin` | Full access ke semua fitur |

## 📄 License

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

---

**Dibuat dengan ❤️**
