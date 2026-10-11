<template>
  <ModulePage
    title="Sumber Perolehan"
    endpoint="/source"
    :columns="columns"
    :fields="fields"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 140 },
  { title: "Nama Sumber", key: "name", width: 240 },
  { title: "Keterangan", key: "description" },
  { title: "Status", key: "is_active", type: "boolean", width: 100 },
];

const fields: FormFieldConfig[] = [
  {
    key: "code",
    label: "Kode Sumber",
    disabled: true,
    placeholder: "Otomatis (SMB-0001)",
  },
  { key: "name", label: "Nama Sumber", required: true },
  { key: "description", label: "Keterangan", type: "textarea" },
  { key: "is_active", label: "Aktif", type: "switch" },
];
</script>
