import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { LocalStorageManager } from "@/utilities/storageManager";

const storageManager = new LocalStorageManager();

export const useThemeStore = defineStore("themeStore", () => {
    const theme = ref();

    const getTheme = computed(() => {
        return theme.value;
    });

    function setTheme(value) {
        theme.value = value;
    }

    function saveTheme() {
        storageManager.set("theme", theme.value);
    }

    function loadTheme() {
        theme.value = storageManager.get("theme");
    }

    return {
        getTheme,
        setTheme,
        saveTheme,
        loadTheme,
    };
});
