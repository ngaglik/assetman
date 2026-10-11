# AssetMan — Asset Management

Frontend aplikasi **AssetMan (Asset Management)** yang terhubung dengan backend ERP
(`erp/backend`). Dibangun dengan **Vue 3 + TypeScript + Vite + Naive UI**, mengikuti
konvensi proyek frontend lain di repo ini (`dashman`, `inventa`).

Data disimpan pada schema PostgreSQL **`ast`**.

## Fitur / Menu

| Menu | Route | Endpoint backend |
| --- | --- | --- |
| Login | `/` | `POST /api/auth/login` |
| Dashboard | `/dashboard` | `GET /api/setman/dashboard/breakdown` |
| Data Barang | `/data-barang` | `/api/setman/data-barang` |
| Penambahan | `/addition` | `/api/setman/addition` |
| Pemeliharaan | `/maintenance` | `/api/setman/maintenance` |
| Pemindahan | `/transfer` | `/api/setman/transfer` |
| Penghapusan | `/disposal` | `/api/setman/disposal` |
| Masterdata → Barang | `/masterdata/barang` | `/api/setman/item` |
| Masterdata → Kategori | `/masterdata/kategori` | `/api/setman/category` |
| Masterdata → Satuan | `/masterdata/satuan` | `/api/setman/unit` |
| Masterdata → Sumber Perolehan | `/masterdata/sumber` | `/api/setman/source` |
| Masterdata → Kondisi | `/masterdata/kondisi` | `/api/setman/condition` |
| Masterdata → Status Penanganan | `/masterdata/status-penanganan` | `/api/setman/handling-status` |

Setiap modul mendukung daftar (dengan pencarian & paginasi), tambah, ubah, dan hapus.

## Dashboard

Menu **Dashboard** (`/dashboard`) menampilkan **Akses Cepat** dan **Rincian Jumlah**
(per Nama Barang / Merk / Tipe / Sumber Perolehan, dihitung dari data penambahan).
Tersedia filter **Tahun**, **Organisasi**, dan **Lokasi** — rincian mengikuti filter yang
dipilih melalui `GET /api/setman/dashboard/breakdown?year=&organization_id=&location_id=`.

## Lapor Kerusakan (Publik / di luar login)

Halaman **Lapor Kerusakan** (`/lapor-kerusakan`) dapat diakses **tanpa login** dan
menjadi **halaman awal** aplikasi bagi user yang belum login (tersedia tautan
**Login** di halaman ini; user yang sudah login diarahkan ke Dashboard). Formulirnya
menulis data ke tabel **Pemeliharaan** (`POST /api/setman/maintenance`) dengan field:

| Field | Keterangan |
| --- | --- |
| Aset | pencarian **kode aset / barcode** + tombol **Scan** (kamera); setelah dipilih tampil **Profil Barang** (nama, kategori, merk, tipe, model, kode aset) |
| Catatan Kerusakan | teks, disimpan ke kolom `description` (**Deskripsi Kerusakan**) |
| Nama Pelapor | teks (kolom `reporter`) |
| Tanggal Kegiatan | default **hari ini** |
| Kondisi Sebelum | **disembunyikan**, otomatis **KND-0002** (Rusak) |
| Status Penanganan | **disembunyikan**, otomatis **STP-0001** (Direncanakan) |

Endpoint yang dipakainya dibuat **anonim** (tanpa login):
`GET /option/conditions`, `GET /option/handling-statuses`, `GET /option/assets`,
dan `POST /maintenance`.

Saat laporan disimpan, **kondisi aset otomatis diubah menjadi `KND-0002` (Rusak)**
(dideteksi dari kolom `reporter` yang terisi pada catatan pemeliharaan).

## Hak Akses

Menu **Penambahan**, **Pemeliharaan**, **Pemindahan**, **Penghapusan**, dan
**Masterdata** hanya dapat dibuka oleh user yang memiliki **tag**
**`SIRSINFRASTRUKTUR`** (dibaca dari `employee.tags` pada data login).
User lain tidak melihat menu tersebut di sidebar, dan rute-nya dijaga
(redirect ke `/dashboard` bila diakses langsung).

## Modul Penambahan

Mencatat penambahan jumlah barang pada suatu **organisasi** dan **lokasi**. Field:
Barang, **NUP**, **Barcode**, **Kondisi**, Jumlah, **Nama Pegawai**, Organisasi, Lokasi,
Tanggal, Sumber Perolehan, Catatan. Kode dibuat otomatis dengan format `<tahun>-<urut>`
(mis. `2026-0001`) — tahun diambil dari tanggal penambahan, nomor urut di-reset per tahun.
Judul modal tambah ditampilkan sebagai **Tambah Data**, field **Jumlah** bernilai
**1** secara bawaan serta bersifat *read-only* (hanya-baca), **Kondisi** bawaan
terisi **Baik** (`KND-0001`), dan **Sumber Perolehan** bawaan terisi **Pengadaan**
(`SMB-0001`).

**Nama Pegawai** diisi lewat pencarian data pegawai (field type `remote`, mencontoh
project CRM/e-kertas): sebuah `n-select` `filterable remote` yang memanggil endpoint
modul `GET /api/setman/option/employees?q=...` pada **setiap perubahan teks** input
pencarian (minimal 2 karakter, maksimal 50 hasil), lalu dipilih dari daftar saran.
Nilai yang disimpan adalah nama pegawai. Setelah pegawai dipilih, field
**Organisasi** otomatis terisi sesuai organisasi pegawai tersebut (mekanisme
`autoFill` pada konfigurasi field).

**Scan barcode lewat kamera:** tombol **Scan** pada field Barcode membuka kamera lalu
membaca barcode memakai `BarcodeDetector` bawaan browser (Chrome/Edge modern;
perlu HTTPS atau `localhost` untuk izin kamera). Bila browser tidak mendukung,
barcode tetap bisa diisi manual.

**Filter:** daftar dapat disaring berdasarkan Nama Barang, Organisasi, Lokasi, dan
Sumber Perolehan. Filter dikirim sebagai query parameter (`item_id`,
`organization_id`, `location_id`, `source_id`) ke endpoint backend.

## Modul Data Barang

Menu **Data Barang** (`/data-barang`) menampilkan **data per penambahan** — setiap
baris mewakili satu penambahan (satu aset) dengan susunan kolom: Kode Aset, Barang,
NUP, Barcode, Kondisi, Jumlah, Nama Pegawai, Organisasi, Lokasi, Tanggal, Sumber
Perolehan. Jadi isinya sesuai dengan data pada menu **Penambahan**. Tombol **Riwayat**
pada setiap baris membuka drawer berisi timeline riwayat **aset** tersebut
**berdasarkan nomor aset** (Kode Aset) — gabungan penambahan → pemeliharaan →
pemindahan → penghapusan untuk aset itu, diurutkan dari yang terbaru.

Daftar dapat disaring berdasarkan Nama Barang, Organisasi, Lokasi, dan Sumber
Perolehan — filter diterapkan langsung pada tiap penambahan, sama seperti di menu
Penambahan. Filter **Nama Barang** memakai daftar nama barang **unik (distinct)**
(`GET /api/setman/option/item-names`) dan mencocokkan nama barang.

Endpoint: `GET /api/setman/data-barang` (daftar + data penambahan terakhir) dan
`GET /api/setman/history/{assetCode}` (riwayat berdasarkan nomor aset).

## Modul Pemeliharaan

Menu **Pemeliharaan** (`/maintenance`) mencatat pemeliharaan barang. Field
**Barang/Aset** berupa pencarian **kode aset atau barcode** (`remote` ke
`GET /api/setman/option/assets?q=...`, ketik minimal 2 karakter atau gunakan tombol
**Scan** kamera). Setelah aset dipilih/ter-scan, tampil panel **Profil Barang**
(Nama Barang, Kategori, Merk, Tipe, Model, Kode Aset).

Kolom **Status Penanganan** pada tabel menampilkan **nama** status (mis.
"Dikerjakan"), bukan kodenya — kode (mis. `STP-0002`) tetap yang disimpan pada
data dan dipakai saat ubah status.

## Modul Pemindahan

Menu **Pemindahan** (`/transfer`) mencatat pemindahan barang antar organisasi/lokasi.
Field **Aset** berupa pencarian **kode aset atau barcode** (`remote` ke
`GET /api/setman/option/assets?q=...`, ketik minimal 2 karakter atau gunakan tombol
**Scan** kamera). Setelah aset dipilih/ter-scan, tampil panel **Profil Barang**
(Nama Barang, Kategori, Merk, Tipe, Model, Kode Aset). Asal barang diisi pada
**Organisasi Asal** & **Lokasi Asal**, tujuan pada **Organisasi Tujuan** &
**Lokasi Tujuan**.

## Kode Otomatis (Auto-Increment)

Untuk modul berikut, kolom `code` diisi **otomatis oleh backend** saat data
ditambah, dengan format `PREFIX-NNNN` (4 digit):

| Modul | Field | Prefix | Contoh |
| --- | --- | --- | --- |
| Masterdata → Barang | `code` | `BRG` | `BRG-0001` |
| Masterdata → Kategori | `code` | `KAT` | `KAT-0001` |
| Masterdata → Satuan | `code` | `SAT` | `SAT-0001` |
| Masterdata → Sumber Perolehan | `code` | `SMB` | `SMB-0001` |
| Masterdata → Kondisi | `code` | `KND` | `KND-0001` |
| Masterdata → Status Penanganan | `code` | `STP` | `STP-0001` |
| Pemindahan | `code` | `PND` | `PND-0001` |
| Pemeliharaan | `code` | `PML` | `PML-0001` |
| Penghapusan | `code` | `HPS` | `HPS-0001` |
| Penambahan | `code` | `<tahun>` | `2026-0001` |

Nomor urut dihitung dari digit terakhir kode yang sudah ada pada tabel
(`MAX(...) + 1`), sehingga tetap berlanjut meski ada data yang dihapus. Field
kode bersifat *read-only* pada form (ditampilkan sebagai "Otomatis") dan tidak
dikirim saat simpan — backend yang mengisinya. Saat edit, kode tidak berubah.

## Workflow Persetujuan (Status)

Modul siklus hidup (Pemeliharaan, Pemindahan, Penghapusan) punya tombol **Status**
di kolom Aksi untuk mengubah tahapan tanpa membuka form edit penuh. Perubahan
dikirim ke:

```
POST /api/setman/{resource}/{id}/status
Content-Type: application/json

{ "status": "approved", "approved_by": "Nama Petugas" }
```

Status divalidasi di backend sesuai daftar berikut:

| Modul | Status yang valid |
| --- | --- |
| Pemeliharaan (`/maintenance`) | kode dari masterdata **Status Penanganan** |
| Pemindahan (`/transfer`) | `draft`, `submitted`, `approved`, `rejected` |
| Penghapusan (`/disposal`) | `draft`, `submitted`, `approved`, `rejected` |

Field **Disetujui / Diproses Oleh** hanya muncul pada modul yang memiliki kolom
`approved_by` (Pemindahan & Penghapusan).

## Menjalankan

Proyek ini menggunakan **pnpm** (konsisten dengan frontend lain di repo ini).

```bash
cd assetman
pnpm install     # gunakan pnpm, bukan npm
pnpm dev         # http://localhost:5176
pnpm build       # output ke dist/ (base path /assetman/)
```

> **Penting — jangan pakai `npm install` untuk proyek ini.** Di environment ini
> `npm` menghasilkan `node_modules` yang tidak lengkap: paket `naive-ui`
> kehilangan folder `es/` (entry ESM yang dipakai Vite), sehingga muncul error
> `Failed to resolve entry for package "naive-ui"`.
>
> Jika sudah terlanjur ter-install dengan npm, bersihkan lalu install ulang:
>
> ```bash
> cd assetman
> rm -rf node_modules package-lock.json
> pnpm install
> pnpm dev
> ```

Konfigurasi koneksi backend melalui environment variable (lihat `.env.example`):

| Variabel | Keterangan |
| --- | --- |
| `VITE_APP_ID` | ID aplikasi untuk login multi-app (mis. `assetman`) |
| `VITE_BACKEND_URL` | URL backend ERP, mis. `http://127.0.0.1:8000` |
| `VITE_TOKEN_NAME` | Kunci localStorage untuk token |
| `VITE_SESSION_NAME` | Kunci localStorage untuk session |

> Backend mengizinkan origin `http://localhost:5173` pada konfigurasi CORS.
> Jika menjalankan pada port lain, sesuaikan kebijakan CORS di `backend/Program.cs`
> atau jalankan Vite pada port tersebut.

## Struktur

```
src/
├── components/
│   ├── Login.vue           # Halaman login (SiJEMPOL)
│   ├── ModulePage.vue      # Komponen CRUD generik (tabel + form + modal)
│   ├── ProfileBar.vue      # Dropdown profil & logout
│   └── Provider.vue        # Konfigurasi Naive UI (theme, locale)
├── constant/
│   ├── config.ts           # Konfigurasi env
│   └── menu.ts             # Struktur menu sidebar
├── container/              # Halaman per menu
│   ├── dashboard/
│   ├── masterdata/
│   ├── barang/             # Data Barang
│   ├── addition/           # Penambahan
│   ├── maintenance/
│   ├── transfer/
│   └── disposal/
├── hooks/useConfig.ts      # Theme & bahasa
├── locales/idID.ts         # Locale Bahasa Indonesia
├── router/router.ts        # Definisi route
├── services/
│   ├── apiClient.ts        # Wrapper fetch + refresh token
│   ├── authService.ts      # Login / logout / penyimpanan token
│   └── assetmanService.ts  # CRUD generik + opsi dropdown
├── types/ui.ts             # Tipe kolom tabel & field form
├── App.vue / App.ts        # Shell aplikasi (header, sidebar, konten)
└── main.ts
```

Logo RSPAW disimpan di `assets/logo-rspaw.png` dan ditampilkan di **header** serta
**halaman login** (mencontoh project `dashman`).

## Menambah modul baru

Cukup buat halaman baru yang memakai `ModulePage` — deklarasikan `columns`
(tabel) dan `fields` (form), lalu daftarkan route-nya di `router/router.ts` dan
item menu di `constant/menu.ts`.

```vue
<template>
  <ModulePage title="Contoh" endpoint="/contoh" :columns="columns" :fields="fields" />
</template>
```

## Backend

Endpoint AssetMan berada di `backend/Endpoints/SetManEndpoints.cs` dengan entity pada
`backend/Models/SetMan.cs` (schema `ast`).

### Migrasi otomatis

Schema `ast` beserta seluruh tabel, indeks, dan seed data awal **dibuat otomatis
saat backend dijalankan** — tidak perlu menjalankan SQL secara manual. Blok
`Auto-migrate ast schema (AssetMan)` di `backend/Program.cs` mengeksekusi DDL
`CREATE SCHEMA/TABLE IF NOT EXISTS` sehingga aman dijalankan berulang (idempoten).
Status migrasi tampil di log startup:

```
[Migration] ast schema (AssetMan) OK
```

Skrip `backend/Data/migration_setman.sql` tetap disediakan sebagai referensi /
tersedia untuk eksekusi manual oleh DBA (isinya identik dengan migrasi otomatis).
# assetman
