import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/projects/:slug",
            name: "project-detail",
            component: () => import("@/views/ProjectDetailView.vue"),
            meta: { title: "Project details" },
        },
    ],
});

export default router;
