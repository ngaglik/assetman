import type { MenuOption } from "naive-ui";

/**
 * Struktur menu sidebar AssetMan.
 * `key` untuk leaf node harus sama dengan path router terkait.
 */
export const LAYOUT_ITEMS: MenuOption[] = [
  {
    label: "Dashboard",
    key: "/dashboard",
  },
  {
    label: "Data Barang",
    key: "/data-barang",
  },
  {
    label: "Penambahan",
    key: "/addition",
  },
  {
    label: "Pemeliharaan",
    key: "/maintenance",
  },
  {
    label: "Pemindahan",
    key: "/transfer",
  },
  {
    label: "Penghapusan",
    key: "/disposal",
  },
  {
    label: "Masterdata",
    key: "/masterdata",
    children: [
      { label: "Barang", key: "/masterdata/barang" },
      { label: "Kategori", key: "/masterdata/kategori" },
      { label: "Satuan", key: "/masterdata/satuan" },
      { label: "Sumber Perolehan", key: "/masterdata/sumber" },
      { label: "Kondisi", key: "/masterdata/kondisi" },
      { label: "Status Penanganan", key: "/masterdata/status-penanganan" },
    ],
  },
];
