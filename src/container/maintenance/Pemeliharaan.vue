<template>
  <ModulePage
    title="Pemeliharaan"
    endpoint="/maintenance"
    :columns="columns"
    :fields="fields"
    :selects="selects"
    add-label="Tambah Catatan"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import {
  loadConditionNames,
  loadHandlingStatusOptions,
  searchAssetsByBarcode,
} from "@/services/assetmanService";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 130 },
  { title: "Kode Aset", key: "asset_code", width: 140 },
  { title: "Barang", key: "item_name", width: 200 },
  { title: "Tgl Kegiatan", key: "activity_date", type: "date", width: 130 },
  { title: "Vendor", key: "vendor", width: 160 },
  { title: "Status Penanganan", key: "status", type: "tag", width: 150 },
  { title: "Deskripsi Kerusakan", key: "description", width: 240 },
];

const fields: FormFieldConfig[] = [
  { key: "code", label: "Kode Pemeliharaan", disabled: true, placeholder: "Otomatis (PML-0001)" },
  {
    key: "asset_code",
    label: "Barang",
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
  { key: "item_id", label: "Barang", hidden: true },
  { key: "activity_date", label: "Tanggal Kegiatan", type: "date" },
  { key: "vendor", label: "Vendor / Pelaksana" },
  { key: "condition_before", label: "Kondisi Sebelum", type: "select" },
  { key: "condition_after", label: "Kondisi Sesudah", type: "select" },
  {
    key: "status",
    label: "Status Penanganan",
    type: "select",
  },
  { key: "description", label: "Deskripsi Kerusakan", type: "textarea" },
  { key: "handling_description", label: "Deskripsi Penanganan", type: "textarea" },
];

const selects = {
  condition_before: loadConditionNames,
  condition_after: loadConditionNames,
  status: loadHandlingStatusOptions,
};
</script>
