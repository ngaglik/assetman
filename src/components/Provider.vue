<template>
  <n-config-provider
    class="demo"
    :locale="lang"
    :date-locale="dateId"
    :theme="theme"
    :theme-overrides="themeOverrides"
  >
    <n-dialog-provider>
      <n-message-provider>
        <n-notification-provider>
          <n-loading-bar-provider>
            <App />
          </n-loading-bar-provider>
        </n-notification-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NNotificationProvider,
  NLoadingBarProvider,
  GlobalThemeOverrides,
} from "naive-ui";
import App from "../App.vue";
import useConfig from "@/hooks/useConfig";
import { dateId } from "@/locales/idID";

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#14b8a6",
    primaryColorHover: "#0d9488",
    primaryColorPressed: "#0f766e",
    primaryColorSuppl: "#0d9488",
    fontSize: "15px",
    borderRadius: "12px",
  },
};

export default defineComponent({
  name: "Provider",
  components: {
    App,
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NNotificationProvider,
    NLoadingBarProvider,
  },
  setup() {
    const { theme, lang } = useConfig();
    return {
      theme,
      lang,
      dateId,
      themeOverrides,
    };
  },
});
</script>

<style>
.demo {
  width: 100%;
  height: 100%;
}
</style>
