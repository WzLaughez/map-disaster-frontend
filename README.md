# Disaster Reporting Frontend

Frontend aplikasi untuk visualisasi laporan bencana yang dikumpulkan via WhatsApp bot.

## Fitur

- 🗺️ **Peta Interaktif**: Visualisasi semua laporan bencana di peta dengan marker berwarna sesuai jenis bencana
- 📋 **Daftar Laporan**: Tampilan list dengan filter berdasarkan jenis bencana
- 📱 **Responsive Design**: Tampilan yang optimal di desktop dan mobile
- 🔄 **Real-time Data**: Mengambil data dari API backend

## Teknologi

- **React 19** dengan TypeScript
- **Vite** untuk build tool
- **React Leaflet** untuk peta interaktif
- **Tailwind CSS** untuk styling
- **React Router** untuk routing
- **Axios** untuk HTTP requests

## Setup

1. Install dependencies:
```bash
npm install
```

2. Buat file `.env` (opsional, default ke `http://localhost:3000`):
```
VITE_API_URL=http://localhost:3000
```

3. Jalankan development server:
```bash
npm run dev
```

4. Build untuk production:
```bash
npm run build
```

## Struktur Project

```
src/
├── components/       # Komponen reusable
│   ├── DisasterMap.tsx   # Komponen peta dengan marker
│   └── ReportList.tsx    # Komponen daftar laporan
├── pages/           # Halaman aplikasi
│   └── Home.tsx     # Halaman utama (map/list view)
├── services/        # API services
│   └── api.ts       # Client untuk backend API
├── types.ts         # TypeScript type definitions
├── App.tsx          # Root component dengan routing
└── main.tsx         # Entry point
```

## API Endpoints

Frontend menggunakan endpoint berikut dari backend:

- `GET /api/reports.geojson` - GeoJSON untuk peta
- `GET /api/reports?page=1&size=50` - Daftar laporan dengan pagination
- `GET /health` - Health check

## Warna Marker

Setiap jenis bencana memiliki warna marker berbeda:
- 🔵 Banjir: Biru
- 🔴 Kebakaran: Merah
- 🟠 Longsor: Amber
- 🟣 Angin: Ungu
- 🩷 Gempa: Pink
- ⚫ Lainnya: Abu-abu
