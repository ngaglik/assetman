<template>
  <div class="lapor-root">
    <div class="lapor-brand">
      <img :src="logoRspaw" alt="Logo RSPAW" class="lapor-logo" />
      <h1 class="lapor-title">Lapor Kerusakan</h1>
      <p class="lapor-sub">Sistem Pelaporan Kerusakan Aset</p>
    </div>

    <n-card :bordered="false" class="lapor-card">
      <n-form label-placement="top">
        <n-form-item label="Aset (kode aset / barcode)">
          <div class="remote-field">
            <n-select
              v-model:value="form.asset_code"
              :options="assetOptions"
              filterable
              remote
              clearable
              placeholder="Scan / ketik barcode atau kode aset..."
              style="flex: 1; min-width: 0"
              @search="onAssetSearch"
              @update:value="onAssetSelect"
            />
            <n-button @click="scannerOpen = true">Scan</n-button>
          </div>
        </n-form-item>

        <div v-if="selectedAsset" class="profil">
          <div class="profil-title">Profil Barang</div>
          <div class="profil-row">
            <span class="k">Nama Barang</span>
            <span class="v">{{ selectedAsset.item_name || "-" }}</span>
          </div>
          <div class="profil-row">
            <span class="k">Kategori</span>
            <span class="v">{{ selectedAsset.category_name || "-" }}</span>
          </div>
          <div class="profil-row">
            <span class="k">Merk</span>
            <span class="v">{{ selectedAsset.brand || "-" }}</span>
          </div>
          <div class="profil-row">
            <span class="k">Tipe</span>
            <span class="v">{{ selectedAsset.tipe || "-" }}</span>
          </div>
          <div class="profil-row">
            <span class="k">Model</span>
            <span class="v">{{ selectedAsset.model || "-" }}</span>
          </div>
          <div class="profil-row">
            <span class="k">Kode Aset</span>
            <span class="v">{{ selectedAsset.asset_code || "-" }}</span>
          </div>
        </div>

        <n-form-item label="Catatan Kerusakan">
          <n-input
            v-model:value="form.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="Uraian kerusakan..."
          />
        </n-form-item>

        <n-form-item label="Nama Pelapor">
          <n-input v-model:value="form.reporter" placeholder="Nama pelapor" />
        </n-form-item>

        <n-form-item label="Tanggal Kegiatan">
          <n-date-picker
            v-model:value="form.activity_date"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 100%"
            placeholder="Pilih tanggal"
          />
        </n-form-item>

        <n-space justify="end">
          <n-button
            type="primary"
            :loading="submitting"
            :disabled="submitting"
            @click="submit"
          >
            Kirim Laporan
          </n-button>
        </n-space>
      </n-form>
    </n-card>

    <p class="lapor-footer">Sistem Manajemen Aset</p>

    <div class="lapor-login">
      <n-button text type="primary" @click="goLogin">Login</n-button>
    </div>

    <BarcodeScanner v-model:show="scannerOpen" @detected="onDetected" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { NButton, useMessage } from "naive-ui";
import { useRouter } from "vue-router";
import BarcodeScanner from "@/components/BarcodeScanner.vue";
import {
  createResource,
  loadConditions,
  loadHandlingStatuses,
  searchAssetsByBarcode,
} from "@/services/assetmanService";
import type { SelectOption } from "@/types/ui";
import logoRspaw from "../../../assets/logo-rspaw.png";

const message = useMessage();
const router = useRouter();

const goLogin = () => router.push("/dashboard");

const assetOptions = ref<SelectOption[]>([]);
const scannerOpen = ref(false);
const submitting = ref(false);
const selectedAsset = ref<any>(null);

function todayStr() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

const form = reactive<{
  asset_code: string | null;
  item_id: number | null;
  reporter: string;
  activity_date: string | null;
  condition_before: string | null;
  status: string | null;
  description: string;
}>({
  asset_code: null,
  item_id: null,
  reporter: "",
  activity_date: todayStr(),
  condition_before: null,
  status: null,
  description: "",
});

async function loadOptions() {
  try {
    const conditions = await loadConditions();
    // Default Kondisi Sebelum = KND-0002 (field disembunyikan, tetap terkirim).
    const defKondisi = conditions.find((c) => c.code === "KND-0002");
    if (defKondisi) form.condition_before = defKondisi.label;
  } catch (e) {
    console.error("Gagal memuat kondisi", e);
  }

  try {
    const statuses = await loadHandlingStatuses();
    // Default Status Penanganan = STP-0001 (field disembunyikan, tetap terkirim).
    const defStatus =
      statuses.find((s) => (s.code ?? "") === "STP-0001") ?? statuses[0];
    if (defStatus) form.status = defStatus.code ?? defStatus.label;
  } catch (e) {
    console.error("Gagal memuat status penanganan", e);
  }
}

async function onAssetSearch(query: string) {
  const q = (query ?? "").trim();
  if (q.length < 2) {
    assetOptions.value = [];
    return;
  }
  try {
    assetOptions.value = await searchAssetsByBarcode(q);
  } catch (e) {
    console.error(e);
    assetOptions.value = [];
  }
}

function onAssetSelect(value: string | null) {
  form.asset_code = value;
  const opt = assetOptions.value.find((o) => o.value === value) ?? null;
  form.item_id = (opt?.item_id as number) ?? null;
  selectedAsset.value = opt;
}

async function onDetected(code: string) {
  scannerOpen.value = false;
  await onAssetSearch(code);
  if (assetOptions.value.length === 1) {
    onAssetSelect(assetOptions.value[0].value as string);
  }
}

function reset() {
  form.asset_code = null;
  form.item_id = null;
  form.reporter = "";
  form.activity_date = todayStr();
  form.description = "";
  selectedAsset.value = null;
}

async function submit() {
  if (!form.asset_code) {
    message.warning("Pilih aset terlebih dahulu.");
    return;
  }
  if (!form.reporter.trim()) {
    message.warning("Nama pelapor wajib diisi.");
    return;
  }
  if (!form.activity_date) {
    message.warning("Tanggal kegiatan wajib diisi.");
    return;
  }

  submitting.value = true;
  try {
    await createResource("/maintenance", {
      asset_code: form.asset_code,
      item_id: form.item_id,
      reporter: form.reporter.trim(),
      activity_date: form.activity_date,
      condition_before: form.condition_before,
      status: form.status,
      description: form.description.trim(),
    });
    message.success("Laporan kerusakan berhasil dikirim. Terima kasih!");
    reset();
  } catch (e) {
    message.error((e as Error).message);
  } finally {
    submitting.value = false;
  }
}

onMounted(loadOptions);
</script>

<style scoped>
.lapor-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 24px 16px;
  background: linear-gradient(135deg, #e6fffb 0%, #f8fafc 100%);
}

.lapor-brand {
  text-align: center;
}

.lapor-logo {
  height: 72px;
  width: auto;
  object-fit: contain;
}

.lapor-title {
  margin: 8px 0 0;
  font-size: 24px;
  font-weight: 400;
  color: #1e293b;
}

.lapor-sub {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 14px;
}

.lapor-card {
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border-radius: 16px;
}

.remote-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.profil {
  margin: 0 0 16px;
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

.lapor-footer {
  color: #94a3b8;
  font-size: 12px;
}

.lapor-login {
  margin-top: -8px;
}
</style>
