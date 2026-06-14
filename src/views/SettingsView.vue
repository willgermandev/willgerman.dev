<script setup>
    import { computed, ref } from "vue";
    import { RouterLink } from "vue-router";

    import MenuSidebar from "@/components/MenuSidebar.vue";

    /**
     * SettingsView — the routed `/settings` shell.
     *
     * Two-region layout: a left-side `<aside>` containing `<MenuSidebar>`
     * (which renders the tab list, owns the mobile drawer, and emits
     * `update:activeTab`) and a right-side `<main id="main-content">`
     * containing a glassmorphic `<section>` whose content swaps based on
     * the active tab. A chevron back affordance in the top-left of the
     * content panel returns the visitor to the home route.
     *
     * Tab definitions are a static array; selection is a local `ref`
     * (no Pinia / no persistence per the resolved plan).
     */
    const tabs = [
        {
            id: "general",
            label: "General",
            heading: "General",
            description: "Coming soon.",
        },
        {
            id: "display",
            label: "Display",
            heading: "Display",
            description: "Coming soon.",
        },
        {
            id: "accessibility",
            label: "Accessibility",
            heading: "Accessibility",
            description: "Coming soon.",
        },
    ];

    const activeTabId = ref(tabs[0].id);

    const activeTab = computed(() => tabs.find((tab) => tab.id === activeTabId.value));
</script>

<template>
    <div class="settings-view flex min-h-screen flex-col gap-6 p-6 lg:flex-row lg:gap-8 lg:p-10">
        <aside
            class="settings-view__sidebar w-full lg:w-64 lg:shrink-0"
            aria-label="Settings navigation"
        >
            <MenuSidebar
                :tabs="tabs"
                v-model:active-tab="activeTabId"
                aria-label="Settings navigation"
            />
        </aside>
        <main
            id="main-content"
            class="settings-view__main flex-1"
        >
            <section
                class="settings-view__panel glass-surface relative rounded-md border border-white p-8 lg:p-12"
                :aria-labelledby="`settings-heading-${activeTab.id}`"
            >
                <RouterLink
                    :to="{ name: 'home' }"
                    class="settings-view__back"
                    aria-label="Back to main menu"
                >
                    <svg
                        class="settings-view__back-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </RouterLink>
                <div class="settings-view__panel-body">
                    <h2
                        :id="`settings-heading-${activeTab.id}`"
                        class="settings-view__heading font-condensed text-3xl"
                    >
                        {{ activeTab.heading }}
                    </h2>
                    <p class="settings-view__copy mt-4 text-base">
                        {{ activeTab.description }}
                    </p>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    /* Back affordance — chevron in the top-left of the content panel.
       44×44 tap target meets WCAG 2.5.5 / the project's accessibility floor.
       Sits at top-4 left-4 by default; when the MenuSidebar hamburger is also
       visible (below lg) the hamburger renders at the document-level top-left,
       so the chevron's panel-local position does not collide with it. */
    .settings-view__back {
        @apply absolute top-4 left-4 inline-flex h-11 w-11 items-center justify-center
            rounded-md text-white no-underline transition-colors motion-reduce:transition-none;
    }

    .settings-view__back:focus-visible {
        @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-black;
    }

    @media (hover: hover) {
        .settings-view__back:hover {
            @apply bg-white/10;
        }
    }

    /* Push the panel body down so the chevron has clearance at top-left.
       The tap target is 44px tall + 16px top offset → 60px reserved. */
    .settings-view__panel-body {
        @apply pt-12 lg:pt-8;
    }
</style>
