<template>
  <ModulePage
    title="Penghapusan Barang"
    endpoint="/disposal"
    :columns="columns"
    :fields="fields"
    :selects="selects"
    add-label="Tambah Penghapusan"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import { loadItems } from "@/services/assetmanService";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 130 },
  { title: "Kode Aset", key: "asset_code", width: 130 },
  { title: "Barang", key: "item_name", width: 200 },
  { title: "Tgl Penghapusan", key: "disposal_date", type: "date", width: 140 },
  { title: "Metode", key: "method", type: "tag", width: 130 },
  { title: "Nilai", key: "value", type: "currency", width: 150 },
  { title: "Status", key: "status", type: "tag", width: 120 },
];

const fields: FormFieldConfig[] = [
  { key: "code", label: "Kode Penghapusan", disabled: true, placeholder: "Otomatis (HPS-0001)" },
  { key: "asset_code", label: "Kode Aset", required: true },
  { key: "item_id", label: "Barang", type: "select" },
  { key: "disposal_date", label: "Tanggal Penghapusan", type: "date" },
  {
    key: "method",
    label: "Metode Penghapusan",
    type: "select",
    options: [
      { label: "Penjualan", value: "sale" },
      { label: "Lelang", value: "auction" },
      { label: "Hibah", value: "grant" },
      { label: "Pemusnahan", value: "destroy" },
    ],
  },
  { key: "value", label: "Nilai", type: "number" },
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
  { key: "reason", label: "Alasan Penghapusan", type: "textarea" },
];

const selects = {
  item_id: loadItems,
};
</script>
