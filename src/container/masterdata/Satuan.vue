<template>
  <ModulePage
    title="Satuan Barang"
    endpoint="/unit"
    :columns="columns"
    :fields="fields"
  />
</template>

<script setup lang="ts">
import ModulePage from "@/components/ModulePage.vue";
import type { TableColumnConfig, FormFieldConfig } from "@/types/ui";

const columns: TableColumnConfig[] = [
  { title: "Kode", key: "code", width: 140 },
  { title: "Nama Satuan", key: "name", width: 240 },
  { title: "Keterangan", key: "description" },
];

const fields: FormFieldConfig[] = [
  { key: "code", label: "Kode Satuan", disabled: true, placeholder: "Otomatis (SAT-0001)" },
  { key: "name", label: "Nama Satuan", required: true },
  { key: "description", label: "Keterangan", type: "textarea" },
];
</script>
