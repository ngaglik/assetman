<template>
  <ModulePage
    title="Barang"
    endpoint="/item"
    :columns="columns"
    :fields="fields"
    :selects="selects"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import { loadCategories, loadUnits } from "@/services/assetmanService";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 140 },
  { title: "Nama Barang", key: "name", width: 240 },
  { title: "Kategori", key: "category_name", width: 160 },
  { title: "Satuan", key: "unit_name", width: 120 },
  { title: "Merek", key: "brand", width: 150 },
  { title: "Tipe", key: "tipe", width: 150 },
  { title: "Model", key: "model", width: 150 },
  { title: "Status", key: "is_active", type: "boolean", width: 100 },
];

const fields: FormFieldConfig[] = [
  { key: "code", label: "Kode Barang", disabled: true, placeholder: "Otomatis (BRG-0001)" },
  { key: "name", label: "Nama Barang", required: true },
  { key: "category_id", label: "Kategori", type: "select" },
  { key: "unit_id", label: "Satuan", type: "select", defaultCode: "SAT-0001" },
  { key: "brand", label: "Merek" },
  { key: "tipe", label: "Tipe" },
  { key: "model", label: "Model" },
  { key: "specification", label: "Spesifikasi", type: "textarea" },
  { key: "is_active", label: "Aktif", type: "switch" },
];

const selects = {
  category_id: loadCategories,
  unit_id: loadUnits,
};
</script>
