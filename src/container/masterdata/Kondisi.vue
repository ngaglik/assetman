<template>
  <ModulePage title="Kondisi" endpoint="/condition" :columns="columns" :fields="fields" />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 140 },
  { title: "Nama Kondisi", key: "name", width: 240 },
  { title: "Keterangan", key: "description" },
  { title: "Status", key: "is_active", type: "boolean", width: 100 },
];

const fields: FormFieldConfig[] = [
  {
    key: "code",
    label: "Kode Kondisi",
    disabled: true,
    placeholder: "Otomatis (KND-0001)",
  },
  { key: "name", label: "Nama Kondisi", required: true },
  { key: "description", label: "Keterangan", type: "textarea" },
  { key: "is_active", label: "Aktif", type: "switch" },
];
</script>
