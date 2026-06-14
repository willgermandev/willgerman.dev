import { describe, it, expect } from "vitest";

import { mount, RouterLinkStub } from "@vue/test-utils";

import ProjectCard from "@/components/ProjectCard.vue";

describe("ProjectCard", () => {
    const baseProps = {
        title: "Test project",
        subtitle: "A subtitle",
        slug: "test-project",
    };

    function mountCard(props = {}) {
        return mount(ProjectCard, {
            props: { ...baseProps, ...props },
            global: {
                stubs: { RouterLink: RouterLinkStub },
            },
        });
    }

    it("renders the title and subtitle text", () => {
        const wrapper = mountCard();
        expect(wrapper.text()).toContain("Test project");
        expect(wrapper.text()).toContain("A subtitle");
    });

    it("links to /projects/<slug>", () => {
        const wrapper = mountCard();
        const link = wrapper.findComponent(RouterLinkStub);
        expect(link.props("to")).toBe("/projects/test-project");
    });

    it("renders the thumbnail when provided, with the supplied alt", () => {
        const wrapper = mountCard({
            thumbnail: "/img/test.webp",
            thumbnailAlt: "Test thumbnail",
        });
        const image = wrapper.find("img");
        expect(image.exists()).toBe(true);
        expect(image.attributes("src")).toBe("/img/test.webp");
        expect(image.attributes("alt")).toBe("Test thumbnail");
    });

    it("falls back to a decorative placeholder when no thumbnail is provided", () => {
        const wrapper = mountCard();
        expect(wrapper.find("img").exists()).toBe(false);
        expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
    });

    it("renders exactly one focusable interactive element", () => {
        const wrapper = mountCard();
        const focusables = wrapper.findAll("a, button, [tabindex]:not([tabindex='-1'])");
        // RouterLinkStub renders as a single <a>; the card surface is the only target.
        expect(focusables).toHaveLength(1);
    });
});
