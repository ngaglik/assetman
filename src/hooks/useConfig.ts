import { computed, ref } from "vue";
import { enUS, darkTheme } from "naive-ui";
import type { GlobalTheme, NLocale } from "naive-ui";
import { idID } from "@/locales/idID";

const THEME_KEY = "assetman:theme";
const LANG_KEY = "assetman:lang";

function initialTheme(): GlobalTheme | null {
  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? (darkTheme as GlobalTheme)
      : null;
  } catch {
    return null;
  }
}

function initialLang(): NLocale {
  try {
    return localStorage.getItem(LANG_KEY) === "en-US" ? enUS : idID;
  } catch {
    return idID;
  }
}

const theme = ref<GlobalTheme | null>(initialTheme());
const lang = ref<NLocale>(initialLang());

export default function useConfig() {
  const changeTheme = () => {
    theme.value = theme.value === null ? (darkTheme as GlobalTheme) : null;
    try {
      localStorage.setItem(THEME_KEY, theme.value === null ? "light" : "dark");
    } catch (e) {
      console.error("Gagal menyimpan theme", e);
    }
  };

  const changeLang = () => {
    lang.value = lang.value.name === "id-ID" ? enUS : idID;
    try {
      localStorage.setItem(LANG_KEY, lang.value.name);
    } catch (e) {
      console.error("Gagal menyimpan bahasa", e);
    }
  };

  return {
    theme: computed(() => theme.value),
    lang: computed(() => lang.value),
    changeTheme,
    changeLang,
  };
}
