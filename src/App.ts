import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useMessage, useDialog, useNotification, useLoadingBar, MenuOption } from "naive-ui";
import { useRouter, useRoute } from "vue-router";
import { getAuthData, logout, hasTag } from "@/services/authService";
import { LAYOUT_ITEMS } from "@/constant/menu";
import ProfileBar from "@/components/ProfileBar.vue";
import Login from "@/components/Login.vue";
import logoRspaw from "../assets/logo-rspaw.png";

export default defineComponent({
  name: "App",
  components: { ProfileBar, Login },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Menu yang hanya boleh diakses user dengan tag SIRSINFRASTRUKTUR.
    const RESTRICTED_MENU_KEYS = [
      "/addition",
      "/maintenance",
      "/transfer",
      "/disposal",
      "/masterdata",
    ];

    const buildMenu = (): MenuOption[] => {
      const items = JSON.parse(JSON.stringify(LAYOUT_ITEMS)) as MenuOption[];
      if (hasTag("SIRSINFRASTRUKTUR")) return items;
      return items.filter(
        (it) => !RESTRICTED_MENU_KEYS.includes(String(it.key)),
      );
    };

    const isMobile = ref(window.innerWidth < 769);
    const collapsed = ref(isMobile.value);
    const activeName = ref(route.path);
    const isLoggedIn = ref(false);
    // Computed agar menu dibangun ulang setelah login (data auth baru tersedia saat itu).
    const layoutOptions = computed<MenuOption[]>(() =>
      isLoggedIn.value ? buildMenu() : [],
    );

    // Rute publik (di luar login), mis. Lapor Kerusakan.
    const isPublicRoute = computed(() => route.meta.public === true);

    // Expose provider APIs secara global (window.$message, dll.)
    window.$message = useMessage();
    window.$dialog = useDialog();
    window.$notification = useNotification();
    window.$loadingBar = useLoadingBar();

    const checkAuth = () => {
      const auth = getAuthData();
      isLoggedIn.value = !!auth?.token;
    };

    const onLoginSuccess = () => {
      checkAuth();
      router.push({ path: "/dashboard" }).catch(() => {});
    };

    const handleMenuSelect = (value: string) => {
      activeName.value = value;
      if (isMobile.value) collapsed.value = true;
      router.push({ path: value }).catch(() => {});
    };

    const handleLogout = () => {
      isLoggedIn.value = false;
      logout();
    };

    let resizeHandler: () => void;

    onMounted(() => {
      checkAuth();
      activeName.value = route.path;

      resizeHandler = () => {
        const mobile = window.innerWidth < 769;
        isMobile.value = mobile;
        if (mobile) collapsed.value = true;
      };
      resizeHandler();
      window.addEventListener("resize", resizeHandler);
    });

    onUnmounted(() => {
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    });

    watch(
      () => route.path,
      (path) => {
        activeName.value = path;
      },
    );

    return {
      layoutOptions,
      collapsed,
      isMobile,
      activeName,
      isLoggedIn,
      logoRspaw,
      isPublicRoute,
      onLoginSuccess,
      handleMenuSelect,
      handleLogout,
    };
  },
});
