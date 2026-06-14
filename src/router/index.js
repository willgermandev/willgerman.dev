import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import("@/views/HomeView.vue"),
            meta: { title: "Main menu" },
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: { name: "home" },
        },
    ],
});

export default router;
