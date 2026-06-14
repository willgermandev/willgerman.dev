import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import SettingsView from "@/views/SettingsView.vue";

function makeTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: "/",
                name: "home",
                component: { template: "<div />" },
            },
            {
                path: "/settings",
                name: "settings",
                component: SettingsView,
            },
        ],
    });
}

async function mountSettingsView() {
    const router = makeTestRouter();
    router.push("/settings");
    await router.isReady();
    return mount(SettingsView, {
        global: { plugins: [router] },
    });
}

describe("SettingsView", () => {
    it("renders the three default tabs in the sidebar", async () => {
        const wrapper = await mountSettingsView();
        const tabs = wrapper.findAll(".menu-sidebar__tab");
        expect(tabs).toHaveLength(3);
        expect(tabs.map((tab) => tab.text())).toEqual(["General", "Display", "Accessibility"]);
    });

    it('declares exactly one <main id="main-content"> landmark', async () => {
        const wrapper = await mountSettingsView();
        const mains = wrapper.findAll("main");
        expect(mains).toHaveLength(1);
        expect(mains[0].attributes("id")).toBe("main-content");
    });

    it("declares an <aside> with an accessible name", async () => {
        const wrapper = await mountSettingsView();
        const aside = wrapper.find("aside.settings-view__sidebar");
        expect(aside.exists()).toBe(true);
        expect(aside.attributes("aria-label")).toBe("Settings navigation");
    });

    it("renders the General panel by default", async () => {
        const wrapper = await mountSettingsView();
        const panel = wrapper.find(".settings-view__panel");
        expect(panel.exists()).toBe(true);
        expect(panel.text()).toContain("General");
        expect(panel.text()).toContain("Coming soon.");
    });

    it("swaps the visible panel when the sidebar emits update:activeTab", async () => {
        const wrapper = await mountSettingsView();
        const tabs = wrapper.findAll(".menu-sidebar__tab");
        await tabs[1].trigger("click");
        const heading = wrapper.find(".settings-view__heading");
        expect(heading.text()).toBe("Display");

        await tabs[2].trigger("click");
        expect(wrapper.find(".settings-view__heading").text()).toBe("Accessibility");
    });

    it("links the panel heading to the panel via aria-labelledby", async () => {
        const wrapper = await mountSettingsView();
        const panel = wrapper.find(".settings-view__panel");
        const heading = wrapper.find(".settings-view__heading");
        expect(panel.attributes("aria-labelledby")).toBe(heading.attributes("id"));
    });

    it("renders a back affordance pointing at the home route", async () => {
        const wrapper = await mountSettingsView();
        const back = wrapper.find(".settings-view__back");
        expect(back.exists()).toBe(true);
        expect(back.element.tagName).toBe("A");
        expect(back.attributes("href")).toBe("/");
        expect(back.attributes("aria-label")).toBe("Back to main menu");
    });

    it("renders the back chevron as an aria-hidden inline SVG", async () => {
        const wrapper = await mountSettingsView();
        const svg = wrapper.find(".settings-view__back svg");
        expect(svg.exists()).toBe(true);
        expect(svg.attributes("aria-hidden")).toBe("true");
        expect(svg.attributes("focusable")).toBe("false");
    });
});
