import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/settings",
            name: "settings",
            component: () => import("@/views/SettingsView.vue"),
            meta: { title: "Settings" },
        },
    ],
});

export default router;
