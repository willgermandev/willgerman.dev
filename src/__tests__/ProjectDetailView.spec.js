import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import ProjectDetailView from "@/views/ProjectDetailView.vue";

function makeTestRouter(initialPath) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: "/projects",
                name: "projects",
                component: { template: "<div />" },
            },
            {
                path: "/projects/:slug",
                name: "project-detail",
                component: ProjectDetailView,
            },
        ],
    });
    router.push(initialPath);
    return router;
}

async function mountAt(path) {
    const router = makeTestRouter(path);
    await router.isReady();
    return mount(ProjectDetailView, {
        global: { plugins: [router] },
    });
}

describe("ProjectDetailView", () => {
    it("renders the resolved project title for a known slug", async () => {
        const wrapper = await mountAt("/projects/project-one");
        expect(wrapper.find("h1").text()).toBe("Project One");
    });

    it("renders the not-found state for an unknown slug", async () => {
        const wrapper = await mountAt("/projects/does-not-exist");
        expect(wrapper.find("h1").text()).toBe("Project not found");
    });

    it("renders a back link to the projects list", async () => {
        const wrapper = await mountAt("/projects/project-one");
        const backLink = wrapper.find("a[href='/projects']");
        expect(backLink.exists()).toBe(true);
        expect(backLink.text()).toContain("Back to projects");
    });
});
