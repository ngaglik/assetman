import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/container/dashboard/Dashboard.vue";
import Barang from "@/container/masterdata/Barang.vue";
import Kategori from "@/container/masterdata/Kategori.vue";
import Satuan from "@/container/masterdata/Satuan.vue";
import SumberPerolehan from "@/container/masterdata/SumberPerolehan.vue";
import Kondisi from "@/container/masterdata/Kondisi.vue";
import StatusPenanganan from "@/container/masterdata/StatusPenanganan.vue";
import DataBarang from "@/container/barang/DataBarang.vue";
import Penambahan from "@/container/addition/Penambahan.vue";
import Pemeliharaan from "@/container/maintenance/Pemeliharaan.vue";
import Pemindahan from "@/container/transfer/Pemindahan.vue";
import Penghapusan from "@/container/disposal/Penghapusan.vue";
import LaporKerusakan from "@/container/public/LaporKerusakan.vue";
import { hasTag, getAuthData } from "@/services/authService";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: () => (getAuthData()?.token ? "/dashboard" : "/lapor-kerusakan") },
    { path: "/lapor-kerusakan", component: LaporKerusakan, meta: { public: true } },
    { path: "/dashboard", component: Dashboard },
    { path: "/masterdata/barang", component: Barang },
    { path: "/masterdata/kategori", component: Kategori },
    { path: "/masterdata/satuan", component: Satuan },
    { path: "/masterdata/sumber", component: SumberPerolehan },
    { path: "/masterdata/kondisi", component: Kondisi },
    { path: "/masterdata/status-penanganan", component: StatusPenanganan },
    { path: "/data-barang", component: DataBarang },
    { path: "/addition", component: Penambahan },
    { path: "/maintenance", component: Pemeliharaan },
    { path: "/transfer", component: Pemindahan },
    { path: "/disposal", component: Penghapusan },
  ],
});

// Route yang hanya boleh diakses user dengan privilege SIRSINFRASTRUKTUR.
const RESTRICTED_PREFIXES = [
  "/addition",
  "/maintenance",
  "/transfer",
  "/disposal",
  "/masterdata",
];

router.beforeEach((to) => {
  const restricted = RESTRICTED_PREFIXES.some(
    (p) => to.path === p || to.path.startsWith(p + "/"),
  );
  if (restricted && !hasTag("SIRSINFRASTRUKTUR")) {
    return { path: "/dashboard" };
  }
  return true;
});

export default router;
