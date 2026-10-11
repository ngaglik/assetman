<template>
  <div class="module-page">
    <n-space vertical :size="16">
      <div class="module-header">
        <n-h3 prefix="bar" class="module-title">{{ props.title }}</n-h3>
        <n-space align="center" :size="8" class="module-filters">
          <n-select
            v-for="f in props.filters"
            :key="f.key"
            v-model:value="filterValues[f.key]"
            :options="filterOptions[f.key] || []"
            :placeholder="f.label"
            clearable
            filterable
            size="small"
            :consistent-menu-width="false"
            :style="{ width: filterWidth(f) }"
            @update:value="onFilterChange"
          />
          <n-input-group class="module-search">
            <n-input
              v-model:value="inputSearch"
              placeholder="Cari data..."
              clearable
              @keydown.enter="handleSearch"
            />
            <n-button type="primary" ghost @click="handleSearch">Cari</n-button>
          </n-input-group>
          <n-button type="primary" @click="openAdd">{{ props.addLabel }}</n-button>
        </n-space>
      </div>

      <n-data-table
        :columns="tableColumns"
        :data="rows"
        :loading="loading"
        :max-height="520"
        :scroll-x="scrollX"
        size="small"
        striped
      />

      <n-space justify="end">
        <n-pagination
          v-model:page="current"
          :page-count="pageCount"
          :page-size="size"
          :item-count="total"
          show-size-picker
          :page-sizes="[10, 20, 50, 100]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
    </n-space>

    <n-modal
      v-model:show="isModalOpen"
      :title="modalTitle"
      preset="card"
      class="module-modal"
      :style="{ width: '720px', maxWidth: '92vw' }"
    >
      <n-form
        :model="formModel"
        label-placement="top"
        require-mark-placement="right-hanging"
      >
        <n-grid :cols="2" :x-gap="16" :y-gap="0">
          <n-form-item-gi
            v-for="f in resolvedFields"
            :key="f.key"
            :label="f.label"
            :span="fieldSpan(f)"
            :path="f.key"
            :rule="fieldRule(f)"
          >
            <n-input
              v-if="fieldType(f) === 'text'"
              v-model:value="formModel[f.key]"
              :disabled="isDisabled(f)"
              :readonly="isReadonly(f)"
              :placeholder="f.placeholder"
            />
            <n-input-group v-else-if="fieldType(f) === 'barcode'">
              <n-input
                v-model:value="formModel[f.key]"
                :disabled="isDisabled(f)"
                :placeholder="f.placeholder || 'Scan atau ketik barcode'"
              />
              <n-button :disabled="isDisabled(f)" @click="openScanner(f.key)">
                Scan
              </n-button>
            </n-input-group>
            <n-input-number
              v-else-if="fieldType(f) === 'number'"
              v-model:value="formModel[f.key]"
              :disabled="isDisabled(f)"
              :readonly="isReadonly(f)"
              :placeholder="f.placeholder"
              style="width: 100%"
            />
            <n-input
              v-else-if="fieldType(f) === 'textarea'"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              v-model:value="formModel[f.key]"
              :disabled="isDisabled(f)"
              :readonly="isReadonly(f)"
              :placeholder="f.placeholder"
            />
            <n-select
              v-else-if="fieldType(f) === 'select'"
              v-model:value="formModel[f.key]"
              :options="f.options || []"
              :disabled="isDisabled(f)"
              clearable
              filterable
              :placeholder="f.placeholder || 'Pilih...'"
            />
            <div v-else-if="fieldType(f) === 'remote'" class="remote-block">
              <div class="remote-field">
                <n-select
                  :value="formModel[f.key]"
                  :options="remoteOptions[f.key]"
                  :disabled="isDisabled(f)"
                  clearable
                  filterable
                  remote
                  style="flex: 1; min-width: 0"
                  :placeholder="f.placeholder || 'Ketik untuk mencari...'"
                  @search="onRemoteSearch(f.key, $event)"
                  @update:value="onRemoteValue(f.key, $event)"
                />
                <n-button
                  v-if="f.scanner"
                  :disabled="isDisabled(f)"
                  @click="openScanner(f.key)"
                >
                  Scan
                </n-button>
              </div>
              <div v-if="f.profile && remoteSelected[f.key]" class="profil">
                <div class="profil-title">Profil Barang</div>
                <div
                  v-for="p in f.profile"
                  :key="p.key"
                  class="profil-row"
                >
                  <span class="k">{{ p.label }}</span>
                  <span class="v">{{ remoteSelected[f.key]?.[p.key] || "-" }}</span>
                </div>
              </div>
            </div>
            <n-date-picker
              v-else-if="fieldType(f) === 'date'"
              v-model:value="formModel[f.key]"
              value-format="yyyy-MM-dd"
              type="date"
              :disabled="isDisabled(f)"
              clearable
              style="width: 100%"
              :placeholder="f.placeholder || 'Pilih tanggal'"
            />
            <n-switch
              v-else-if="fieldType(f) === 'switch'"
              v-model:value="formModel[f.key]"
              :disabled="isDisabled(f)"
            />
          </n-form-item-gi>
        </n-grid>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button @click="closeModal">Batal</n-button>
          <n-button type="primary" :loading="submitting" @click="submit">
            {{ isEditMode ? "Simpan Perubahan" : "Simpan" }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal
      v-model:show="statusModalOpen"
      title="Ubah Status"
      preset="card"
      style="max-width: 420px"
    >
      <n-form label-placement="top">
        <n-form-item label="Status">
          <n-select
            v-model:value="statusValue"
            :options="statusFieldOptions"
            placeholder="Pilih status..."
          />
        </n-form-item>
        <n-form-item v-if="hasApprover" label="Disetujui / Diproses Oleh">
          <n-input
            v-model:value="approverValue"
            placeholder="Nama petugas"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="statusModalOpen = false">Batal</n-button>
          <n-button type="primary" :loading="statusSaving" @click="saveStatus">
            Simpan
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <BarcodeScanner v-model:show="scannerOpen" @detected="onBarcodeDetected" />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { useMessage, useDialog, NButton, NTag, NText } from "naive-ui";
import {
  listResource,
  createResource,
  updateResource,
  deleteResource,
  updateStatus,
} from "@/services/assetmanService";
import type { SelectOption, TableColumnConfig, FormFieldConfig, FilterConfig } from "@/types/ui";
import BarcodeScanner from "@/components/BarcodeScanner.vue";

const props = defineProps({
  title: { type: String, required: true },
  endpoint: { type: String, required: true },
  columns: { type: Array as () => TableColumnConfig[], default: () => [] },
  fields: { type: Array as () => FormFieldConfig[], default: () => [] },
  selects: {
    type: Object as () => Record<string, () => Promise<SelectOption[]>>,
    default: () => ({}),
  },
  filters: { type: Array as () => FilterConfig[], default: () => [] },
  idKey: { type: String, default: "id" },
  pageSize: { type: Number, default: 20 },
  addLabel: { type: String, default: "Tambah Data" },
  addTitle: { type: String, default: undefined },
  editTitle: { type: String, default: undefined },
});

const message = useMessage();
const dialog = useDialog();

const rows = ref<any[]>([]);
const loading = ref(false);
const submitting = ref(false);
const inputSearch = ref("");
const current = ref(1);
const size = ref(props.pageSize);
const total = ref(0);

const isModalOpen = ref(false);
const isEditMode = ref(false);
const formModel = reactive<Record<string, any>>({});
const dynamicOptions = reactive<Record<string, SelectOption[]>>({});
const remoteOptions = reactive<Record<string, SelectOption[]>>({});
const remoteSelected = reactive<Record<string, any | null>>({});
const filterValues = reactive<Record<string, any>>({});
const filterOptions = reactive<Record<string, SelectOption[]>>({});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(total.value / size.value)),
);
const modalTitle = computed(() =>
  isEditMode.value
    ? props.editTitle ?? `Edit ${props.title}`
    : props.addTitle ?? `Tambah ${props.title}`,
);
const scrollX = computed(
  () => props.columns.reduce((sum, c) => sum + (c.width ?? 160), 0) + 160,
);

// Workflow status: aktif bila modul memiliki field select ber-key "status".
const statusField = computed(() =>
  props.fields.find((f) => f.key === "status" && f.type === "select"),
);
const statusFieldOptions = computed(() => {
  const f = statusField.value;
  if (!f) return [];
  return f.options ?? dynamicOptions[f.key] ?? [];
});
const hasApprover = computed(() =>
  props.fields.some((f) => f.key === "approved_by"),
);
const resource = computed(() => props.endpoint.replace(/^\//, ""));

const statusModalOpen = ref(false);
const statusRow = ref<any>(null);
const statusValue = ref<string | null>(null);
const approverValue = ref("");
const statusSaving = ref(false);

const scannerOpen = ref(false);
const scannerTargetKey = ref<string | null>(null);

const resolvedFields = computed(() =>
  props.fields
    .filter((f) => !f.hidden)
    .map((f) => ({
      ...f,
      options: f.options ?? dynamicOptions[f.key] ?? [],
    })),
);

const fieldType = (f: FormFieldConfig) => f.type ?? "text";
const fieldSpan = (f: FormFieldConfig) =>
  f.span ?? (fieldType(f) === "textarea" ? 2 : 1);
const isDisabled = (f: FormFieldConfig) =>
  !!f.disabled || (isEditMode.value && !!f.editDisabled);
const isReadonly = (f: FormFieldConfig) => !!f.readonly;
const fieldRule = (f: FormFieldConfig) =>
  f.required
    ? {
        required: true,
        message: `${f.label} wajib diisi`,
        trigger: ["input", "blur", "change"],
      }
    : undefined;

function formatCurrency(value: any) {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(value: any) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function renderCell(row: any, col: TableColumnConfig) {
  const value = row[col.key];

  switch (col.type) {
    case "boolean":
      return h(
        NTag,
        {
          type: value ? "success" : "default",
          size: "small",
          bordered: false,
        },
        { default: () => (value ? "Aktif" : "Nonaktif") },
      );
    case "tag": {
      // Tampilkan nama opsi bila nilai kolom cocok dengan opsi select
      // (mis. kolom "status" menyimpan kode "STP-0002" → tampil "Dikerjakan").
      const label = optionLabel(col.key, value) ?? (value ? String(value) : null);
      return label
        ? h(
            NTag,
            { size: "small", type: "info", bordered: false },
            { default: () => label },
          )
        : h(NText, { depth: 3 }, { default: () => "-" });
    }
    case "currency":
      return formatCurrency(value);
    case "date":
      return formatDate(value);
    default:
      return value === null || value === undefined || value === ""
        ? h(NText, { depth: 3 }, { default: () => "-" })
        : String(value);
  }
}

/** Label opsi dari nilai tersimpan (mis. kode status) bila opsi tersedia. */
function optionLabel(key: string, value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  const fieldOpts = props.fields.find((f) => f.key === key)?.options;
  const opts = (dynamicOptions[key]?.length ? dynamicOptions[key] : fieldOpts) ?? [];
  const found = opts.find((o) => String(o.value) === String(value));
  return found ? String(found.label) : null;
}

const tableColumns = computed(() => {
  // Sentuh `dynamicOptions` agar kolom tag (mis. label status penanganan)
  // ikut ter-render ulang setelah opsi select selesai dimuat.
  void Object.keys(dynamicOptions).length;
  return [
    ...props.columns.map((col) => ({
      title: col.title,
      key: col.key,
      width: col.width,
      ellipsis: { tooltip: true },
      render: (row: any) => renderCell(row, col),
    })),
    {
      title: "Aksi",
      key: "actions",
      width: statusField.value ? 220 : 150,
      fixed: "right",
      render: (row: any) =>
        h("div", { style: "display:flex; gap:6px;" }, [
          ...(statusField.value
            ? [
                h(
                  NButton,
                  {
                    size: "tiny",
                    type: "info",
                    secondary: true,
                    onClick: () => openStatus(row),
                  },
                  { default: () => "Status" },
                ),
              ]
            : []),
          h(
            NButton,
            {
              size: "tiny",
              type: "primary",
              secondary: true,
              onClick: () => openEdit(row),
            },
            { default: () => "Edit" },
          ),
          h(
            NButton,
            {
              size: "tiny",
              type: "error",
              secondary: true,
              onClick: () => confirmRemove(row),
            },
            { default: () => "Hapus" },
          ),
        ]),
    },
  ];
});

async function fetchData(page = 1) {
  loading.value = true;
  try {
    const result = await listResource(props.endpoint, {
      page,
      pageSize: size.value,
      inputSearch: inputSearch.value,
      filters: { ...filterValues },
    });
    rows.value = result.data ?? [];
    current.value = result.page ?? page;
    total.value = result.total ?? 0;
  } catch (e) {
    message.error((e as Error).message);
    rows.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

async function loadDynamicOptions() {
  for (const [key, loader] of Object.entries(props.selects)) {
    try {
      dynamicOptions[key] = await loader();
    } catch (e) {
      console.error(`Gagal memuat opsi untuk "${key}"`, e);
      dynamicOptions[key] = [];
    }
  }
  // Terapkan default select (mis. kondisi) setelah opsi tersedia.
  if (isModalOpen.value) applyOptionDefaults();
}

/** Set nilai default field select berdasarkan `defaultCode`/`defaultLabel`. */
function applyOptionDefaults() {
  if (isEditMode.value) return;
  for (const f of props.fields) {
    if (f.defaultCode == null && f.defaultLabel == null) continue;
    const options = dynamicOptions[f.key] ?? [];
    if (!options.length) continue;
    const match =
      f.defaultCode != null
        ? options.find((o) => o.code === f.defaultCode)
        : options.find((o) => o.label === f.defaultLabel);
    if (match) formModel[f.key] = match.value;
  }
}

async function loadFilterOptions() {
  for (const f of props.filters) {
    try {
      filterOptions[f.key] = await f.loader();
    } catch (e) {
      console.error(`Gagal memuat filter "${f.key}"`, e);
      filterOptions[f.key] = [];
    }
  }
}

/** Lebar select filter (px) — dari config `width`, default 170. */
const filterWidth = (f: FilterConfig) => `${f.width ?? 170}px`;

function onFilterChange() {
  current.value = 1;
  fetchData(1);
}

/**
 * Pencarian opsi untuk field type "remote" (mis. nama pegawai).
 * Dipicu setiap teks pada input pencarian berubah; minimal 2 karakter.
 */
async function onRemoteSearch(key: string, query: string) {
  const f = props.fields.find((x) => x.key === key);
  if (!f?.search) return;
  const q = (query ?? "").trim();
  if (q.length < 2) {
    remoteOptions[key] = [];
    return;
  }
  try {
    remoteOptions[key] = await f.search(q, formModel);
  } catch (e) {
    console.error(`Gagal mencari opsi "${key}"`, e);
    remoteOptions[key] = [];
  }
}

/**
 * Saat nilai field "remote" berubah (mis. pegawai dipilih), simpan nilainya lalu
 * isi field lain sesuai `autoFill` (mis. organisasi pegawai).
 */
function onRemoteValue(key: string, value: any) {
  formModel[key] = value;
  const f = props.fields.find((x) => x.key === key);
  const opt = (remoteOptions[key] ?? []).find((o) => o.value === value) as any;
  remoteSelected[key] = opt ?? null;
  if (!f?.autoFill) return;
  if (!opt) return;
  for (const [targetKey, optionKey] of Object.entries(f.autoFill)) {
    const v = opt[optionKey];
    if (v !== null && v !== undefined) formModel[targetKey] = v;
  }
}

function blankForm() {
  Object.keys(formModel).forEach((k) => delete formModel[k]);
  Object.keys(remoteSelected).forEach((k) => delete remoteSelected[k]);
  props.fields.forEach((f) => {
    if (f.default !== undefined) {
      formModel[f.key] = f.default;
      return;
    }
    if (fieldType(f) === "switch") {
      formModel[f.key] = true;
      return;
    }
    formModel[f.key] = null;
  });
}

function toDateString(value: any): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value.slice(0, 10);
  if (typeof value === "number") {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 10);
  }
  return null;
}

function openAdd() {
  isEditMode.value = false;
  try {
    blankForm();
    applyOptionDefaults();
  } catch (e) {
    console.error("Gagal menyiapkan form tambah", e);
  }
  isModalOpen.value = true;
}

function openEdit(row: any) {
  isEditMode.value = true;
  try {
    blankForm();
    // Simpan PK agar URL update memakai id yang benar.
    formModel[props.idKey] = row[props.idKey];
    props.fields.forEach((f) => {
      let value = row[f.key];
      if (fieldType(f) === "date") value = toDateString(value);
      if (fieldType(f) === "switch") value = !!value;
      formModel[f.key] = value ?? formModel[f.key];
    });
    // Field remote: seed opsi dari nilai tersimpan agar label tetap tampil.
    props.fields.forEach((f) => {
      if (fieldType(f) === "remote" && formModel[f.key]) {
        const display = f.displayKey ? row[f.displayKey] : formModel[f.key];
        remoteOptions[f.key] = [
          { label: String(display ?? formModel[f.key]), value: formModel[f.key] },
        ];
      }
    });
  } catch (e) {
    console.error("Gagal menyiapkan form edit", e);
  }
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

function confirmRemove(row: any) {
  dialog.warning({
    title: "Konfirmasi Hapus",
    content: "Apakah Anda yakin ingin menghapus data ini?",
    positiveText: "Hapus",
    negativeText: "Batal",
    onPositiveClick: () => remove(row),
  });
}

async function remove(row: any) {
  try {
    await deleteResource(props.endpoint, row[props.idKey]);
    message.success("Data berhasil dihapus");
    await fetchData(current.value);
  } catch (e) {
    message.error((e as Error).message);
  }
}

async function submit() {
  const missing = props.fields.filter(
    (f) =>
      f.required &&
      !isDisabled(f) &&
      (formModel[f.key] === null ||
        formModel[f.key] === undefined ||
        formModel[f.key] === ""),
  );
  if (missing.length) {
    message.warning(`Kolom wajib diisi: ${missing.map((m) => m.label).join(", ")}`);
    return;
  }

  const payload: Record<string, any> = {};
  props.fields.forEach((f) => {
    if (isDisabled(f)) return;
    let value = formModel[f.key];
    if (fieldType(f) === "date") value = toDateString(value);
    payload[f.key] = value;
  });

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateResource(props.endpoint, formModel[props.idKey], payload);
      message.success("Data berhasil diperbarui");
    } else {
      await createResource(props.endpoint, payload);
      message.success("Data berhasil ditambahkan");
    }
    isModalOpen.value = false;
    await fetchData(isEditMode.value ? current.value : 1);
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    submitting.value = false;
  }
}

function handleSearch() {
  current.value = 1;
  fetchData(1);
}

function handlePageChange(page: number) {
  current.value = page;
  fetchData(page);
}

function handlePageSizeChange(pageSize: number) {
  size.value = pageSize;
  fetchData(1);
}

function openStatus(row: any) {
  statusRow.value = row;
  statusValue.value = row.status ?? null;
  approverValue.value = row.approved_by ?? "";
  statusModalOpen.value = true;
}

async function saveStatus() {
  if (!statusValue.value) {
    message.warning("Pilih status terlebih dahulu");
    return;
  }

  statusSaving.value = true;
  try {
    await updateStatus(resource.value, statusRow.value[props.idKey], {
      status: statusValue.value,
      approved_by: hasApprover.value ? approverValue.value : undefined,
    });
    message.success("Status berhasil diubah");
    statusModalOpen.value = false;
    await fetchData(current.value);
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    statusSaving.value = false;
  }
}

function openScanner(key: string) {
  scannerTargetKey.value = key;
  scannerOpen.value = true;
}

function onBarcodeDetected(code: string) {
  const key = scannerTargetKey.value;
  scannerOpen.value = false;
  if (!key) return;
  const f = props.fields.find((x) => x.key === key);
  if (f && fieldType(f) === "remote") {
    onRemoteScan(key, code);
  } else {
    formModel[key] = code;
  }
}

/** Hasil scan barcode untuk field "remote": cari opsi, lalu pilih otomatis bila tunggal. */
async function onRemoteScan(key: string, code: string) {
  await onRemoteSearch(key, code);
  const options = remoteOptions[key] ?? [];
  if (options.length === 1) onRemoteValue(key, options[0].value);
}

onMounted(() => {
  fetchData(1);
  loadDynamicOptions();
  loadFilterOptions();
});
</script>

<style scoped>
.module-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.module-title {
  margin: 0;
}

.module-search {
  max-width: 360px;
}

.module-filters {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.remote-block {
  width: 100%;
}

.remote-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.profil {
  margin: 10px 0 4px;
  padding: 12px 14px;
  border: 1px solid var(--n-border-color, #eef0f4);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
}

.profil-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 8px;
  color: var(--n-text-color, #1e293b);
}

.profil-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 0;
  font-size: 13px;
}

.profil-row .k {
  color: var(--n-text-color-3, #94a3b8);
}

.profil-row .v {
  color: var(--n-text-color, #1e293b);
  font-weight: 600;
  text-align: right;
}
</style>
