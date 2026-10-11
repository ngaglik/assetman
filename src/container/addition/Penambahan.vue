<template>
  <ModulePage
    title="Penambahan"
    endpoint="/addition"
    :columns="columns"
    :fields="fields"
    :selects="selects"
    :filters="filters"
    add-label="Tambah Penambahan"
    add-title="Tambah Data"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import {
  loadConditions,
  loadDistinctItems,
  loadItemNames,
  loadLocations,
  loadOrganizations,
  loadSources,
  searchEmployees,
} from "@/services/assetmanService";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 130 },
  { title: "Barang", key: "item_name", width: 180 },
  { title: "NUP", key: "nup", width: 100 },
  { title: "Barcode", key: "barcode", width: 150 },
  { title: "Kondisi", key: "kondisi_name", type: "tag", width: 120 },
  { title: "Jumlah", key: "qty", width: 90 },
  { title: "Nama Pegawai", key: "pegawai", width: 180 },
  { title: "Organisasi", key: "organization_name", width: 180 },
  { title: "Lokasi", key: "location_name", width: 160 },
  { title: "Tanggal", key: "addition_date", type: "date", width: 130 },
  { title: "Sumber Perolehan", key: "source_name", width: 160 },
];

const fields: FormFieldConfig[] = [
  {
    key: "code",
    label: "Kode Aset",
    disabled: true,
    placeholder: `Otomatis (${new Date().getFullYear()}-0001)`,
  },
  { key: "item_id", label: "Barang", type: "select", required: true, span: 2 },
  {
    key: "barcode",
    label: "Barcode",
    type: "barcode",
    span: 2,
    placeholder: "Scan atau ketik barcode",
  },
  { key: "nup", label: "NUP", placeholder: "Nomor Urut Pendaftaran" },
  { key: "kondisi_id", label: "Kondisi", type: "select", defaultCode: "KND-0001" },
  { key: "qty", label: "Jumlah", type: "number", required: true, default: 1, readonly: true },
  {
    key: "pegawai",
    label: "Nama Pegawai",
    type: "remote",
    search: searchEmployees,
    autoFill: { organization_id: "organization_id" },
    span: 2,
    placeholder: "Ketik nama untuk mencari...",
  },
  {
    key: "organization_id",
    label: "Organisasi",
    type: "select",
    required: true,
    span: 2,
  },
  { key: "location_id", label: "Lokasi", type: "select", required: true, span: 2 },
  { key: "addition_date", label: "Tanggal Penambahan", type: "date" },
  { key: "source_id", label: "Sumber Perolehan", type: "select", defaultCode: "SMB-0001" },
  { key: "notes", label: "Catatan", type: "textarea" },
];

const selects = {
  item_id: loadDistinctItems,
  organization_id: loadOrganizations,
  location_id: loadLocations,
  source_id: loadSources,
  kondisi_id: loadConditions,
};

const filters = [
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
</script>
