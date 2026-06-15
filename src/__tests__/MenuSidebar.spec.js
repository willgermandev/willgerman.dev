import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import MenuSidebar from "@/components/MenuSidebar.vue";

const tabs = [
    { id: "profile", label: "Profile" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
];

function makeTestRouter() {
    return createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: "/settings/profile",
                name: "settings-profile",
                component: { template: "<div />" },
            },
            {
                path: "/settings/notifications",
                name: "settings-notifications",
                component: { template: "<div />" },
            },
        ],
    });
}

describe("MenuSidebar", () => {
    it("renders an aside landmark with the provided accessible name", () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile", ariaLabel: "Settings navigation" },
        });
        const aside = wrapper.find("aside");
        expect(aside.exists()).toBe(true);
        expect(aside.attributes("aria-label")).toBe("Settings navigation");
    });

    it("renders one tab button per tab entry with the matching label", () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        expect(buttons).toHaveLength(tabs.length);
        expect(buttons.map((button) => button.text())).toEqual([
            "Profile",
            "Notifications",
            "Appearance",
        ]);
    });

    it("marks the active tab as pressed and emits update:activeTab on click", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        expect(buttons[0].attributes("aria-pressed")).toBe("true");
        expect(buttons[1].attributes("aria-pressed")).toBe("false");

        await buttons[1].trigger("click");
        expect(wrapper.emitted("update:activeTab")).toEqual([["notifications"]]);
    });

    it("does not re-emit when the already-active tab is clicked again", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        await wrapper.findAll(".menu-sidebar__tab")[0].trigger("click");
        expect(wrapper.emitted("update:activeTab")).toBeUndefined();
    });

    it("moves focus and emits on ArrowDown", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        await buttons[0].trigger("keydown", { key: "ArrowDown" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["notifications"]]);
        expect(document.activeElement).toBe(buttons[1].element);
        wrapper.unmount();
    });

    it("wraps focus from the last tab to the first on ArrowDown", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "appearance" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        await buttons[2].trigger("keydown", { key: "ArrowDown" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["profile"]]);
        wrapper.unmount();
    });

    it("wraps focus from the first tab to the last on ArrowUp", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        await buttons[0].trigger("keydown", { key: "ArrowUp" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["appearance"]]);
        wrapper.unmount();
    });

    it("jumps to first and last via Home and End", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "notifications" },
            attachTo: document.body,
        });
        const buttons = wrapper.findAll(".menu-sidebar__tab");
        await buttons[1].trigger("keydown", { key: "End" });
        await buttons[2].trigger("keydown", { key: "Home" });
        expect(wrapper.emitted("update:activeTab")).toEqual([["appearance"], ["profile"]]);
        wrapper.unmount();
    });

    it("renders a RouterLink with aria-current when the tab carries a `to`", async () => {
        const router = makeTestRouter();
        router.push("/");
        await router.isReady();
        const routedTabs = [
            { id: "profile", label: "Profile", to: { name: "settings-profile" } },
            { id: "notifications", label: "Notifications", to: { name: "settings-notifications" } },
        ];
        const wrapper = mount(MenuSidebar, {
            props: { tabs: routedTabs, activeTab: "profile" },
            global: { plugins: [router] },
        });
        const links = wrapper.findAll(".menu-sidebar__tab");
        expect(links[0].element.tagName).toBe("A");
        expect(links[0].attributes("aria-current")).toBe("page");
        expect(links[1].attributes("aria-current")).toBeUndefined();
    });

    it("renders a hamburger trigger with aria-expanded reflecting the open state", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
        });
        const trigger = wrapper.find(".menu-sidebar__trigger");
        expect(trigger.exists()).toBe(true);
        expect(trigger.attributes("aria-expanded")).toBe("false");
        await trigger.trigger("click");
        expect(trigger.attributes("aria-expanded")).toBe("true");
    });

    it("supports v-model:open and emits update:open when the trigger is clicked", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile", open: false },
        });
        await wrapper.find(".menu-sidebar__trigger").trigger("click");
        expect(wrapper.emitted("update:open")).toEqual([[true]]);
    });

    it("closes the drawer when the backdrop is clicked", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        await wrapper.find(".menu-sidebar__trigger").trigger("click");
        // Backdrop is rendered inside a <Transition>; it should be present
        // synchronously after the open toggles to true.
        const backdrop = wrapper.find(".menu-sidebar__backdrop");
        expect(backdrop.exists()).toBe(true);
        await backdrop.trigger("click");
        expect(wrapper.find(".menu-sidebar__backdrop").exists()).toBe(false);
        expect(wrapper.find(".menu-sidebar__trigger").attributes("aria-expanded")).toBe("false");
        wrapper.unmount();
    });

    it("locks body scroll while the drawer is open and unlocks on close", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        expect(document.documentElement.classList.contains("menu-sidebar-scroll-lock")).toBe(false);
        await wrapper.find(".menu-sidebar__trigger").trigger("click");
        expect(document.documentElement.classList.contains("menu-sidebar-scroll-lock")).toBe(true);
        await wrapper.find(".menu-sidebar__backdrop").trigger("click");
        expect(document.documentElement.classList.contains("menu-sidebar-scroll-lock")).toBe(false);
        wrapper.unmount();
    });

    it("closes the drawer on Escape", async () => {
        const wrapper = mount(MenuSidebar, {
            props: { tabs, activeTab: "profile" },
            attachTo: document.body,
        });
        await wrapper.find(".menu-sidebar__trigger").trigger("click");
        expect(wrapper.find(".menu-sidebar__trigger").attributes("aria-expanded")).toBe("true");
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await wrapper.vm.$nextTick();
        expect(wrapper.find(".menu-sidebar__trigger").attributes("aria-expanded")).toBe("false");
        wrapper.unmount();
    });
});
