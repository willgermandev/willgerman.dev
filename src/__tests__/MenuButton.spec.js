import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import MenuButton from "@/components/MenuButton.vue";

function makeTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [{ path: "/projects", name: "projects", component: { template: "<div />" } }],
    });
}

describe("MenuButton", () => {
    it("renders the label verbatim and carries the uppercase-applying class", () => {
        const wrapper = mount(MenuButton, {
            props: { label: "Projects" },
        });
        // The DOM text matches the prop's original casing — uppercasing is a CSS
        // concern (text-transform), not a JS one. This is deliberate so screen
        // readers announce the natural-case word, not letter-by-letter caps.
        expect(wrapper.text()).toBe("Projects");
        // The `.menu-button` class is the carrier of the `uppercase` utility
        // declared in the SFC's scoped style block. We assert on the class
        // rather than `getComputedStyle(...).textTransform` because jsdom does
        // not load Vite/Tailwind-processed SFC scoped styles into the test DOM.
        expect(wrapper.classes()).toContain("menu-button");
    });

    it("renders as a native button when no `to` is provided and emits click", async () => {
        const wrapper = mount(MenuButton, {
            props: { label: "Quit" },
        });
        expect(wrapper.element.tagName).toBe("BUTTON");
        await wrapper.trigger("click");
        expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("renders as a RouterLink when `to` is provided", async () => {
        const router = makeTestRouter();
        router.push("/");
        await router.isReady();
        const wrapper = mount(MenuButton, {
            props: { label: "Projects", to: { name: "projects" } },
            global: { plugins: [router] },
        });
        expect(wrapper.element.tagName).toBe("A");
        expect(wrapper.attributes("href")).toBe("/projects");
    });
});
