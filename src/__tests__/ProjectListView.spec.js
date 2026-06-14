import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";

import ProjectListView from "@/views/ProjectListView.vue";

const ProjectCardStub = {
    name: "ProjectCard",
    props: ["slug", "title", "subtitle", "thumbnail", "thumbnailAlt"],
    template: '<a :data-slug="slug">{{ title }}</a>',
};

function mountView() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: "/projects",
                name: "project-list",
                component: ProjectListView,
            },
            {
                path: "/projects/:slug",
                name: "project-detail",
                component: { template: "<div />" },
            },
        ],
    });
    return mount(ProjectListView, {
        global: {
            plugins: [router],
            stubs: { ProjectCard: ProjectCardStub },
        },
    });
}

describe("ProjectListView", () => {
    it("renders exactly 8 ProjectCard instances", () => {
        const wrapper = mountView();
        expect(wrapper.findAllComponents(ProjectCardStub)).toHaveLength(8);
    });

    it("renders a single h1 heading", () => {
        const wrapper = mountView();
        const heading = wrapper.find("h1");
        expect(heading.exists()).toBe(true);
        expect(heading.text().length).toBeGreaterThan(0);
    });

    it("declares a <main id='main-content'> landmark", () => {
        const wrapper = mountView();
        const main = wrapper.find("main#main-content");
        expect(main.exists()).toBe(true);
    });

    it("passes unique slug, title, and subtitle to every card", () => {
        const wrapper = mountView();
        const cards = wrapper.findAllComponents(ProjectCardStub);
        const slugs = cards.map((card) => card.props("slug"));
        expect(new Set(slugs).size).toBe(8);
        cards.forEach((card) => {
            expect(card.props("title")).toMatch(/^Project /);
            expect(typeof card.props("subtitle")).toBe("string");
        });
    });

    it("wraps the cards in a <ul role='list'> with one <li> per project", () => {
        const wrapper = mountView();
        const list = wrapper.find("ul[role='list']");
        expect(list.exists()).toBe(true);
        expect(list.findAll("li")).toHaveLength(8);
    });
});
