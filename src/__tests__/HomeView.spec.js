import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { mount } from "@vue/test-utils";
import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "@/views/HomeView.vue";

function mountWithRouter() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: "/", name: "home", component: HomeView },
            { path: "/projects", name: "project-list", component: { template: "<div />" } },
            { path: "/settings", name: "settings", component: { template: "<div />" } },
        ],
    });
    return mount(HomeView, {
        global: {
            plugins: [router],
            stubs: {
                // Stub MenuButton to a button that surfaces label + emits click + exposes `to`.
                MenuButton: {
                    props: ["label", "to"],
                    inheritAttrs: false,
                    template:
                        '<button type="button" :data-to="to ? JSON.stringify(to) : null" @click="$emit(\'click\')">{{ label }}</button>',
                },
            },
        },
    });
}

describe("HomeView", () => {
    it("renders the title, subtitle, and three menu buttons in order", () => {
        const wrapper = mountWithRouter();
        expect(wrapper.find("h1").text()).toBe("[Title placeholder — TBD]");
        expect(wrapper.find("p").text()).toBe("[Heading placeholder — TBD]");

        const buttons = wrapper.findAll("button");
        expect(buttons).toHaveLength(3);
        expect(buttons[0].text()).toBe("START");
        expect(buttons[1].text()).toBe("SETTINGS");
        expect(buttons[2].text()).toBe("QUIT");
    });

    it("wires Start and Settings to their named routes", () => {
        const wrapper = mountWithRouter();
        const buttons = wrapper.findAll("button");
        expect(JSON.parse(buttons[0].attributes("data-to"))).toEqual({ name: "project-list" });
        expect(JSON.parse(buttons[1].attributes("data-to"))).toEqual({ name: "settings" });
        expect(buttons[2].attributes("data-to")).toBeUndefined();
    });

    it('declares its own <main id="main-content"> landmark', () => {
        const wrapper = mountWithRouter();
        const main = wrapper.find("main");
        expect(main.exists()).toBe(true);
        expect(main.attributes("id")).toBe("main-content");
    });

    describe("Quit", () => {
        let originalClose;
        let infoSpy;

        beforeEach(() => {
            originalClose = window.close;
            infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
        });

        afterEach(() => {
            window.close = originalClose;
            infoSpy.mockRestore();
        });

        it("calls window.close() and logs the documented hint when the browser refuses", async () => {
            const closeSpy = vi.fn();
            window.close = closeSpy;

            const wrapper = mountWithRouter();
            await wrapper.findAll("button")[2].trigger("click");

            expect(closeSpy).toHaveBeenCalledTimes(1);
            expect(infoSpy).toHaveBeenCalledWith(
                "Tab close blocked by browser; please close this tab manually.",
            );
        });

        it("logs the documented hint even if window.close() throws", async () => {
            window.close = () => {
                throw new Error("blocked");
            };

            const wrapper = mountWithRouter();
            await wrapper.findAll("button")[2].trigger("click");

            expect(infoSpy).toHaveBeenCalledWith(
                "Tab close blocked by browser; please close this tab manually.",
            );
        });
    });
});
