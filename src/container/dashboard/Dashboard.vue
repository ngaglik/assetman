<template>
  <div class="dashboard">
    <div class="dash-header">
      <div class="dash-heading">
        <n-h3 prefix="bar" class="dash-title">Dashboard AssetMan</n-h3>
        <n-text depth="3" class="dash-sub">
          Ringkasan pengelolaan aset tahun {{ year }}
        </n-text>
      </div>
      <n-space align="center" :size="8">
        <n-select
          v-model:value="year"
          :options="yearOptions"
          size="small"
          style="width: 110px"
        />
        <n-select
          v-model:value="organizationId"
          :options="orgOptions"
          :loading="optionsLoading"
          placeholder="Organisasi"
          clearable
          filterable
          size="small"
          style="width: 220px"
        />
        <n-select
          v-model:value="locationId"
          :options="locOptions"
          :loading="optionsLoading"
          placeholder="Lokasi"
          clearable
          filterable
          size="small"
          style="width: 200px"
        />
        <n-button size="small" :loading="loading" @click="load">
          ↻ Muat Ulang
        </n-button>
      </n-space>
    </div>

    <n-alert v-if="error" type="warning">{{ error }}</n-alert>

    <n-spin :show="loading">
      <!-- ── Akses Cepat ─────────────────────────────────────────── -->
      <section class="section">
        <div class="section-head">
          <span class="section-title">⚡ Akses Cepat</span>
        </div>
        <n-grid
          :cols="10"
          :x-gap="12"
          :y-gap="12"
          responsive="screen"
          item-responsive
        >
          <n-gi v-for="link in quickLinks" :key="link.path" span="5 s:4 m:1">
            <button class="quick-card" @click="$router.push(link.path)">
              <span class="quick-icon">{{ link.icon }}</span>
              <span class="quick-label">{{ link.label }}</span>
            </button>
          </n-gi>
        </n-grid>
      </section>

      <!-- ── Rincian Jumlah ──────────────────────────────────────── -->
      <section class="section">
        <div class="section-head">
          <span class="section-title">📊 Rincian Jumlah</span>
          <span class="section-note">total unit (jumlah data penambahan)</span>
        </div>
        <n-grid :cols="2" :x-gap="12" :y-gap="12" responsive="screen" item-responsive>
          <n-gi v-for="panel in breakdownPanels" :key="panel.title" span="2 m:1">
            <div class="panel">
              <div class="panel-head">
                <div class="panel-title">
                  <span class="panel-icon">{{ panel.icon }}</span>
                  {{ panel.title }}
                </div>
                <div class="panel-total">{{ formatNumber(panel.total) }}</div>
              </div>

              <n-empty
                v-if="!panel.rows.length"
                size="small"
                description="Belum ada data"
                style="padding: 12px 0"
              />

              <div v-else class="panel-list">
                <div v-for="(r, i) in panel.rows" :key="i" class="row">
                  <span class="row-rank" :class="{ top: i === 0 }">{{ i + 1 }}</span>
                  <div class="row-body">
                    <div class="row-top">
                      <span class="row-label" :title="r.label || '-'">
                        {{ r.label || "-" }}
                      </span>
                      <span class="row-value">
                        {{ formatNumber(r.qty) }}
                        <span class="row-count">({{ r.count }})</span>
                      </span>
                    </div>
                    <div class="row-bar">
                      <div
                        class="row-bar-fill"
                        :style="{ width: barWidth(r.qty, panel.max) }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-gi>
        </n-grid>
      </section>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  fetchDashboardBreakdown,
  loadOrganizations,
  loadLocations,
} from "@/services/assetmanService";
import type { DashboardBreakdown } from "@/services/assetmanService";

const now = new Date().getFullYear();
const year = ref(now);
const organizationId = ref<string | null>(null);
const locationId = ref<string | null>(null);
const orgOptions = ref<{ label: string; value: string }[]>([]);
const locOptions = ref<{ label: string; value: string }[]>([]);
const optionsLoading = ref(false);
const loading = ref(false);
const error = ref("");
const breakdown = ref<DashboardBreakdown | null>(null);

const yearOptions = Array.from({ length: 6 }).map((_, i) => ({
  label: String(now - 3 + i),
  value: now - 3 + i,
}));

const quickLinks = [
  { label: "Masterdata", path: "/masterdata/barang", icon: "📦" },
  { label: "Penambahan", path: "/addition", icon: "➕" },
  { label: "Pemeliharaan", path: "/maintenance", icon: "🛠️" },
  { label: "Pemindahan", path: "/transfer", icon: "🔀" },
  { label: "Penghapusan", path: "/disposal", icon: "🗑️" },
];

const PANEL_META: {
  title: string;
  key: keyof DashboardBreakdown;
  icon: string;
}[] = [
  { title: "Per Nama Barang", key: "by_item", icon: "📦" },
  { title: "Per Merk", key: "by_brand", icon: "🏷️" },
  { title: "Per Tipe", key: "by_tipe", icon: "🧩" },
  { title: "Per Sumber Perolehan", key: "by_source", icon: "🧾" },
];

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat("id-ID").format(value ?? 0);
}

function barWidth(qty: number | undefined, max: number) {
  if (!max) return "0%";
  return `${Math.max(6, Math.round(((qty ?? 0) / max) * 100))}%`;
}

const breakdownPanels = computed(() =>
  PANEL_META.map((meta) => {
    const rows = breakdown.value?.[meta.key] ?? [];
    const total = rows.reduce((sum, r) => sum + (r.qty ?? 0), 0);
    const max = rows.reduce((m, r) => Math.max(m, r.qty ?? 0), 0);
    return { ...meta, rows, total, max };
  }),
);

async function loadOptions() {
  optionsLoading.value = true;
  try {
    const [orgs, locs] = await Promise.all([
      loadOrganizations(),
      loadLocations(),
    ]);
    orgOptions.value = orgs as { label: string; value: string }[];
    locOptions.value = locs as { label: string; value: string }[];
  } catch (e) {
    console.error("Gagal memuat opsi filter dashboard", e);
  } finally {
    optionsLoading.value = false;
  }
}

async function load() {
  loading.value = true;
  error.value = "";
  try {
    breakdown.value = await fetchDashboardBreakdown(
      year.value,
      organizationId.value,
      locationId.value,
    );
  } catch (e) {
    error.value = (e as Error).message;
    breakdown.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadOptions();
  load();
});

// Rincian Jumlah selalu mengikuti filter Tahun / Organisasi / Lokasi.
watch([year, organizationId, locationId], () => load());
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ──────────────────────────────────────────────────── */
.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.dash-heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash-title {
  margin: 0;
}

.dash-sub {
  font-size: 13px;
}

/* ── Sections ────────────────────────────────────────────────── */
.section-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--n-text-color, #1e293b);
}

.section-note {
  font-size: 12px;
  font-weight: 400;
  color: var(--n-text-color-3, #94a3b8);
}

/* ── Akses Cepat ─────────────────────────────────────────────── */
.quick-card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 8px;
  border-radius: 14px;
  border: 1px solid var(--n-border-color, #eef0f4);
  background: linear-gradient(135deg, #ffffff 0%, #14b8a6 100%);
  cursor: pointer;
  text-align: center;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  border-color: rgba(20, 184, 166, 0.45);
  box-shadow: 0 8px 20px rgba(13, 148, 136, 0.18);
}

.quick-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 19px;
  line-height: 1;
  background: rgba(20, 184, 166, 0.16);
  flex-shrink: 0;
}

.quick-label {
  font-weight: 600;
  font-size: 12px;
  line-height: 1.25;
  color: #ea580c;
}

/* ── Rincian panels ──────────────────────────────────────────── */
.panel {
  height: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--n-border-color, #eef0f4);
  background: linear-gradient(135deg, #ffffff 0%, #14b8a6 100%);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.panel-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  color: var(--n-text-color, #1e293b);
}

.panel-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1;
  background: rgba(20, 184, 166, 0.16);
}

.panel-total {
  font-weight: 800;
  font-size: 22px;
  color: #ea580c;
}

.panel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.row-rank {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  background: rgba(100, 116, 139, 0.14);
}

.row-rank.top {
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0f766e);
}

.row-body {
  flex: 1;
  min-width: 0;
}

.row-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.row-label {
  font-size: 13px;
  color: var(--n-text-color, #334155);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-value {
  font-size: 16px;
  font-weight: 800;
  color: #ea580c;
  white-space: nowrap;
}

.row-count {
  margin-left: 2px;
  font-weight: 400;
  color: var(--n-text-color-3, #94a3b8);
}

.row-bar {
  margin-top: 5px;
  height: 6px;
  border-radius: 4px;
  background: rgba(100, 116, 139, 0.14);
  overflow: hidden;
}

.row-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #14b8a6, #0f766e);
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .dashboard {
    gap: 16px;
  }
}
</style>
