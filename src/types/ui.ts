export interface SelectOption {
  label: string;
  value: string | number;
  /** Kode masterdata (mis. `KND-0001`), bila disediakan backend. */
  code?: string | null;
  /** ID organisasi terkait (mis. untuk pegawai), bila disediakan backend. */
  organization_id?: string | null;
  /** ID barang terkait (mis. untuk opsi aset), bila disediakan backend. */
  item_id?: number | null;
}

export interface FilterConfig {
  key: string;
  label: string;
  loader: () => Promise<SelectOption[]>;
  /** Lebar select filter (px). Default 170. */
  width?: number;
}

export interface TableColumnConfig {
  title: string;
  key: string;
  width?: number;
  /** Formatting khusus untuk kolom. Default: teks biasa. */
  type?: "text" | "tag" | "currency" | "date" | "boolean";
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "textarea"
    | "select"
    | "date"
    | "switch"
    | "barcode"
    | "remote";
  options?: SelectOption[];
  /**
   * Pencarian opsi dinamis via server saat teks berubah (untuk type "remote").
   * `form` berisi nilai form saat ini (mis. untuk memfilter berdasarkan field lain).
   */
  search?: (
    query: string,
    form?: Record<string, any>,
  ) => Promise<SelectOption[]>;
  /** Tampilkan tombol Scan kamera (untuk type "remote"). */
  scanner?: boolean;
  /**
   * Tampilkan panel profil dari opsi terpilih (untuk type "remote").
   * Contoh: `profile: [{ label: "Nama Barang", key: "item_name" }]`.
   */
  profile?: { label: string; key: string }[];
  /**
   * Nama kolom baris untuk dijadikan label saat edit (untuk type "remote"),
   * karena nilai field berupa id sehingga tidak ada opsi yang cocok.
   * Contoh: `displayKey: "item_name"`.
   */
  displayKey?: string;
  /**
   * Isi field lain saat opsi field ini dipilih.
   * Format: `{ <key field tujuan>: <nama properti opsi> }`.
   * Contoh: memilih pegawai → organisasi otomatis terisi
   * `autoFill: { organization_id: "organization_id" }`.
   */
  autoFill?: Record<string, string>;
  required?: boolean;
  /** Selalu nonaktif (mis. primary key). */
  disabled?: boolean;
  /** Nonaktif hanya saat mode edit (mis. kode unik). */
  editDisabled?: boolean;
  placeholder?: string;
  /** Nilai awal saat form tambah dibuka. */
  default?: any;
  /** Default field select: cocokkan opsi berdasarkan `code` (mis. "KND-0001"). */
  defaultCode?: string;
  /** Default field select: cocokkan opsi berdasarkan `label`. */
  defaultLabel?: string;
  /** Selalu hanya-baca (tidak bisa diubah). */
  readonly?: boolean;
  /** Sembunyikan dari form (tetap diikutkan saat simpan). */
  hidden?: boolean;
  /** Lebar kolom pada grid form (1 atau 2). */
  span?: number;
}
