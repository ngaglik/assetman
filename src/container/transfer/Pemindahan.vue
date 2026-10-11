<template>
  <ModulePage
    title="Pemindahan"
    endpoint="/transfer"
    :columns="columns"
    :fields="fields"
    :selects="selects"
    add-label="Tambah Pemindahan"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import {
  loadLocations,
  loadOrganizations,
  searchAssetsByBarcode,
} from "@/services/assetmanService";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 130 },
  { title: "Kode Aset", key: "asset_code", width: 130 },
  { title: "Barang", key: "item_name", width: 180 },
  { title: "Organisasi Asal", key: "from_organization_name", width: 180 },
  { title: "Organisasi Tujuan", key: "to_organization_name", width: 180 },
  { title: "Lokasi Asal", key: "from_location_name", width: 160 },
  { title: "Lokasi Tujuan", key: "to_location_name", width: 160 },
  { title: "Tgl Pindah", key: "transfer_date", type: "date", width: 130 },
  { title: "Status", key: "status", type: "tag", width: 120 },
];

const fields: FormFieldConfig[] = [
  { key: "code", label: "Kode Pemindahan", disabled: true, placeholder: "Otomatis (PND-0001)" },
  {
    key: "asset_code",
    label: "Aset",
    type: "remote",
    search: searchAssetsByBarcode,
    displayKey: "item_name",
    autoFill: { item_id: "item_id" },
    span: 2,
    required: true,
    scanner: true,
    placeholder: "Scan / ketik barcode atau kode aset...",
    profile: [
      { label: "Nama Barang", key: "item_name" },
      { label: "Kategori", key: "category_name" },
      { label: "Merk", key: "brand" },
      { label: "Tipe", key: "tipe" },
      { label: "Model", key: "model" },
      { label: "Kode Aset", key: "asset_code" },
    ],
  },
  { key: "item_id", label: "Aset", hidden: true },
  { key: "from_organization_id", label: "Organisasi Asal", type: "select" },
  { key: "from_location_id", label: "Lokasi Asal", type: "select" },
  { key: "to_organization_id", label: "Organisasi Tujuan", type: "select" },
  { key: "to_location_id", label: "Lokasi Tujuan", type: "select" },
  { key: "transfer_date", label: "Tanggal Pemindahan", type: "date" },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Diajukan", value: "submitted" },
      { label: "Disetujui", value: "approved" },
      { label: "Ditolak", value: "rejected" },
    ],
  },
  { key: "approved_by", label: "Disetujui Oleh" },
  { key: "reason", label: "Alasan Pemindahan", type: "textarea" },
];

const selects = {
  from_organization_id: loadOrganizations,
  to_organization_id: loadOrganizations,
  from_location_id: loadLocations,
  to_location_id: loadLocations,
};
</script>
