<template>
  <div>
    <n-space vertical :size="16">
      <div class="page-header">
        <n-h3 prefix="bar" class="page-title">Data Barang</n-h3>
        <n-space align="center" :size="8" class="page-filters">
          <n-select
            v-for="f in filters"
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
          <n-input-group class="page-search">
            <n-input
              v-model:value="inputSearch"
              placeholder="Cari barang..."
              clearable
              @keydown.enter="handleSearch"
            />
            <n-button type="primary" ghost @click="handleSearch">Cari</n-button>
          </n-input-group>
        </n-space>
      </div>

      <n-data-table
        :columns="columns"
        :data="rows"
        :loading="loading"
        :max-height="520"
        :scroll-x="1800"
        size="small"
        striped
      />

      <n-space justify="end">
        <n-pagination
          v-model:page="current"
          :page-count="pageCount"
          :page-size="size"
          :item-count="total"
          @update:page="fetchData"
        />
      </n-space>
    </n-space>

    <n-drawer
      v-model:show="historyOpen"
      :width="'min(600px, 92vw)'"
      placement="right"
    >
      <n-drawer-content closable>
        <template #header>Riwayat Barang</template>

        <div class="history-head">
          <div class="history-name">{{ selected?.item_name }}</div>
          <n-tag size="small" :bordered="false" type="info">
            {{ selected?.code }}
          </n-tag>
        </div>

        <n-spin :show="historyLoading">
          <n-empty
            v-if="!historyLoading && history.length === 0"
            description="Belum ada riwayat"
            style="margin-top: 48px"
          />
          <n-timeline v-else style="margin-top: 12px">
            <n-timeline-item
              v-for="(h, i) in history"
              :key="i"
              :type="timelineType(h.type)"
              :title="timelineTitle(h)"
              :time="formatDate(h.date)"
            >
              <div
                v-for="(d, di) in detailLines(h)"
                :key="di"
                class="history-detail"
              >
                {{ d }}
              </div>
            </n-timeline-item>
          </n-timeline>
        </n-spin>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from "vue";
import { NButton, useMessage } from "naive-ui";
import {
  listResource,
  loadAssetHistory,
  loadItemNames,
  loadLocations,
  loadOrganizations,
  loadSources,
} from "@/services/assetmanService";
import type { HistoryEntry } from "@/services/assetmanService";
import type { FilterConfig, SelectOption } from "@/types/ui";

const message = useMessage();

const rows = ref<any[]>([]);
const loading = ref(false);
const inputSearch = ref("");
const current = ref(1);
const size = ref(20);
const total = ref(0);

const filters: FilterConfig[] = [
  { key: "item_name", label: "Nama Barang", loader: loadItemNames, width: 320 },
  {
    key: "organization_id",
    label: "Organisasi",
    loader: loadOrganizations,
    width: 240,
  },
  { key: "location_id", label: "Lokasi", loader: loadLocations },
  { key: "source_id", label: "Sumber Perolehan", loader: loadSources },
];

const filterValues = reactive<Record<string, string | number | null>>({});
const filterOptions = reactive<Record<string, SelectOption[]>>({});

const historyOpen = ref(false);
const historyLoading = ref(false);
const history = ref<HistoryEntry[]>([]);
const selected = ref<any>(null);

const pageCount = computed(() =>
  Math.max(1, Math.ceil(total.value / size.value)),
);

const TIMELINE_TYPES: Record<
  string,
  "success" | "info" | "error" | "warning"
> = {
  penambahan: "success",
  pemeliharaan: "warning",
  pemindahan: "info",
  penghapusan: "error",
};

function timelineType(type?: string | null) {
  return TIMELINE_TYPES[type ?? ""] ?? "default";
}

function capitalize(value?: string | null) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function timelineTitle(entry: HistoryEntry) {
  return entry.code ? `${capitalize(entry.type)} — ${entry.code}` : capitalize(entry.type);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function detailLines(entry: HistoryEntry): string[] {
  const lines: (string | false | null | undefined)[] = [];

  if (entry.type === "penambahan") {
    lines.push(`Jumlah: ${entry.qty ?? 0}`);
    lines.push(entry.organization_name && `Organisasi: ${entry.organization_name}`);
    lines.push(entry.location_name && `Lokasi: ${entry.location_name}`);
    lines.push(entry.kondisi_name && `Kondisi: ${entry.kondisi_name}`);
    lines.push(entry.pegawai && `Pegawai: ${entry.pegawai}`);
    lines.push(entry.source_name && `Sumber perolehan: ${entry.source_name}`);
    lines.push(entry.nup && `NUP: ${entry.nup}`);
    lines.push(entry.barcode && `Barcode: ${entry.barcode}`);
    lines.push(entry.notes && `Catatan: ${entry.notes}`);
  } else if (entry.type === "pemindahan") {
    lines.push(entry.asset_code && `Kode aset: ${entry.asset_code}`);
    lines.push(
      `Dari: ${entry.organization_name ?? "-"} / ${entry.location_name ?? "-"}`,
    );
    lines.push(
      `Ke: ${entry.to_organization_name ?? "-"} / ${entry.to_location_name ?? "-"}`,
    );
    lines.push(entry.notes && `Alasan: ${entry.notes}`);
  } else if (entry.type === "penghapusan") {
    lines.push(entry.asset_code && `Kode aset: ${entry.asset_code}`);
    lines.push(entry.method && `Metode: ${entry.method}`);
    lines.push(entry.value != null && `Nilai: ${formatCurrency(entry.value)}`);
    lines.push(entry.notes && `Alasan: ${entry.notes}`);
  } else if (entry.type === "pemeliharaan") {
    lines.push(entry.condition_before && `Status Awal: ${entry.condition_before}`);
    lines.push(entry.notes && `Catatan kerusakan: ${entry.notes}`);
    lines.push(
      entry.handling_description && `Catatan penanganan: ${entry.handling_description}`,
    );
    lines.push(entry.condition_after && `Status Akhir: ${entry.condition_after}`);
  }

  return lines.filter((l): l is string => !!l);
}

const columns = computed(() => [
  { title: "Kode Aset", key: "code", width: 150 },
  { title: "Barang", key: "item_name", width: 220 },
  { title: "NUP", key: "nup", width: 100 },
  { title: "Barcode", key: "barcode", width: 150 },
  { title: "Kondisi", key: "kondisi_name", width: 120 },
  { title: "Jumlah", key: "qty", width: 90 },
  { title: "Nama Pegawai", key: "pegawai", width: 180 },
  { title: "Organisasi", key: "organization_name", width: 200 },
  { title: "Lokasi", key: "location_name", width: 180 },
  {
    title: "Tanggal",
    key: "addition_date",
    width: 130,
    render: (row: any) => formatDate(row.addition_date),
  },
  { title: "Sumber Perolehan", key: "source_name", width: 160 },
  {
    title: "Aksi",
    key: "actions",
    width: 110,
    fixed: "right",
    render: (row: any) =>
      h(
        NButton,
        {
          size: "small",
          type: "primary",
          secondary: true,
          onClick: () => openHistory(row),
        },
        { default: () => "Riwayat" },
      ),
  },
]);

async function fetchData(page = 1) {
  loading.value = true;
  try {
    const result = await listResource("/data-barang", {
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

async function openHistory(row: any) {
  selected.value = row;
  history.value = [];
  historyOpen.value = true;
  historyLoading.value = true;
  try {
    history.value = await loadAssetHistory(row.code);
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    historyLoading.value = false;
  }
}

function handleSearch() {
  current.value = 1;
  fetchData(1);
}

async function loadFilterOptions() {
  for (const f of filters) {
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

onMounted(() => {
  loadFilterOptions();
  fetchData(1);
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
}

.page-filters {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.page-search {
  max-width: 360px;
}

.history-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.history-name {
  font-weight: 600;
  font-size: 15px;
  word-break: break-word;
}

.history-detail {
  font-size: 13px;
  color: var(--n-text-color-2, #555);
  word-break: break-word;
}
</style>
