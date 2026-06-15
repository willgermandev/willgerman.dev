<script setup>
    import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";

    /**
     * MenuSidebar — a reusable sidebar of navigational tabs.
     *
     * Renders an `<aside>` landmark containing one focusable control per
     * `tabs` entry. Each entry is either a native `<button type="button">`
     * (default) or a `<RouterLink>` (when the entry carries a `to`).
     *
     * Public API:
     *   - tabs        (Array, required): [{ id, label, to? }]. `to` is a
     *                                    string or vue-router location object.
     *   - activeTab   (String|null):     v-model — the active tab's id.
     *   - ariaLabel   (String):          accessible name for the <aside>
     *                                    landmark. Default "Section navigation".
     *   - open        (Boolean):         v-model:open — controls drawer
     *                                    visibility below md. Optional;
     *                                    when omitted the component manages
     *                                    its own internal open state.
     *
     * Emits:
     *   - update:activeTab (String): emitted whenever a tab is activated
     *                                (mouse, keyboard activation, or arrow-
     *                                key automatic activation).
     *   - update:open      (Boolean): emitted whenever the drawer opens or
     *                                 closes (mobile breakpoint only).
     *
     * Keyboard model (automatic activation, WAI-ARIA "tabs" pattern adapted
     * for a sidebar — see NOTE below):
     *   - ArrowDown / ArrowUp move focus AND emit update:activeTab,
     *     wrapping at both ends.
     *   - Home / End jump to the first / last tab.
     *   - Native Tab cycles through tabs; Enter / Space activate.
     *   - Escape closes the drawer (mobile only) and returns focus to the
     *     hamburger trigger.
     *
     * NOTE: This component deliberately does NOT use the WAI-ARIA
     * tablist / tab / tabpanel triad. That pattern is for co-located tabs
     * + panels in the same focus context. A settings-style sidebar where
     * the "panel" is a separate region (or route) is better-served by a
     * plain list of focusable buttons with `aria-pressed` (and
     * `aria-current="page"` for routed entries). Activating a tab here
     * is also assumed to be cheap (automatic activation under arrow
     * keys) — consumers should not wire expensive side-effects to tab
     * change.
     */
    const props = defineProps({
        tabs: {
            type: Array,
            required: true,
            validator: (value) =>
                Array.isArray(value) &&
                value.every(
                    (tab) =>
                        tab &&
                        typeof tab.id === "string" &&
                        typeof tab.label === "string" &&
                        (tab.to === undefined ||
                            typeof tab.to === "string" ||
                            typeof tab.to === "object"),
                ),
        },
        activeTab: {
            type: String,
            default: null,
        },
        ariaLabel: {
            type: String,
            default: "Section navigation",
        },
        open: {
            type: Boolean,
            default: null,
        },
    });

    const emit = defineEmits(["update:activeTab", "update:open"]);

    // Track button refs by index for focus management.
    const buttonRefs = ref([]);

    function setButtonRef(element, index) {
        // Vue's :ref function callback fires with the component instance for
        // <RouterLink>; unwrap to the underlying <a> via $el. For native
        // buttons the element is already the DOM node.
        const dom = element && element.$el ? element.$el : element;
        if (dom) {
            buttonRefs.value[index] = dom;
        }
    }

    function selectTab(tab) {
        if (tab.id !== props.activeTab) {
            emit("update:activeTab", tab.id);
        }
    }

    function focusAndSelect(index) {
        if (props.tabs.length === 0) {
            return;
        }
        const wrapped = (index + props.tabs.length) % props.tabs.length;
        const target = buttonRefs.value[wrapped];
        if (target) {
            target.focus();
            selectTab(props.tabs[wrapped]);
        }
    }

    function handleKeydown(event, index) {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                focusAndSelect(index + 1);
                break;
            case "ArrowUp":
                event.preventDefault();
                focusAndSelect(index - 1);
                break;
            case "Home":
                event.preventDefault();
                focusAndSelect(0);
                break;
            case "End":
                event.preventDefault();
                focusAndSelect(props.tabs.length - 1);
                break;
        }
    }

    // ─── Mobile drawer state ──────────────────────────────────────────────
    //
    // Below the md breakpoint the sidebar collapses to a hamburger trigger
    // that opens an overlay drawer. We support both controlled (v-model:open
    // from the parent) and uncontrolled (internal ref) usage; the
    // `isControlled` computed picks the right source of truth.

    const internalOpen = ref(false);
    const isControlled = computed(() => props.open !== null);
    const isOpen = computed(() => (isControlled.value ? props.open : internalOpen.value));

    const triggerRef = ref(null);
    const drawerRef = ref(null);

    function setOpen(next) {
        if (isControlled.value) {
            emit("update:open", next);
        } else {
            internalOpen.value = next;
        }
    }

    function closeDrawer() {
        setOpen(false);
    }

    function toggleDrawer() {
        setOpen(!isOpen.value);
    }

    // ─── Drawer side-effects: focus management, scroll lock ───────────────
    //
    // When the drawer opens we lock body scroll, move focus into the drawer,
    // and listen for Escape at the document level. When it closes we undo
    // each of these and return focus to the hamburger trigger.

    function lockBodyScroll() {
        if (typeof document !== "undefined") {
            document.documentElement.classList.add("menu-sidebar-scroll-lock");
        }
    }

    function unlockBodyScroll() {
        if (typeof document !== "undefined") {
            document.documentElement.classList.remove("menu-sidebar-scroll-lock");
        }
    }

    function focusFirstTabInDrawer() {
        const target = buttonRefs.value[0];
        if (target) {
            target.focus();
        } else if (drawerRef.value) {
            drawerRef.value.focus();
        }
    }

    function returnFocusToTrigger() {
        if (triggerRef.value) {
            triggerRef.value.focus();
        }
    }

    function handleDocumentKeydown(event) {
        if (event.key === "Escape" && isOpen.value) {
            event.preventDefault();
            closeDrawer();
            returnFocusToTrigger();
        }
    }

    // Inline focus trap. Drawer is `tabindex="-1"` so the focused fallback
    // works; otherwise we cycle Tab / Shift+Tab between the first and last
    // focusable controls inside the drawer.
    function trapFocusOnTab(event) {
        if (event.key !== "Tab" || !isOpen.value || !drawerRef.value) {
            return;
        }
        const focusables = drawerRef.value.querySelectorAll(
            'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) {
            event.preventDefault();
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }

    watch(isOpen, async (next) => {
        if (next) {
            lockBodyScroll();
            if (typeof document !== "undefined") {
                document.addEventListener("keydown", handleDocumentKeydown);
            }
            await nextTick();
            focusFirstTabInDrawer();
        } else {
            unlockBodyScroll();
            if (typeof document !== "undefined") {
                document.removeEventListener("keydown", handleDocumentKeydown);
            }
        }
    });

    onBeforeUnmount(() => {
        unlockBodyScroll();
        if (typeof document !== "undefined") {
            document.removeEventListener("keydown", handleDocumentKeydown);
        }
    });

    function handleBackdropClick() {
        closeDrawer();
        returnFocusToTrigger();
    }
</script>

<template>
    <div class="menu-sidebar-root">
        <!-- Hamburger trigger — visible below md only. -->
        <button
            ref="triggerRef"
            type="button"
            class="menu-sidebar__trigger"
            :aria-expanded="isOpen ? 'true' : 'false'"
            aria-controls="menu-sidebar-drawer"
            aria-label="Open section navigation"
            @click="toggleDrawer"
        >
            <span
                class="menu-sidebar__trigger-bar"
                aria-hidden="true"
            />
            <span
                class="menu-sidebar__trigger-bar"
                aria-hidden="true"
            />
            <span
                class="menu-sidebar__trigger-bar"
                aria-hidden="true"
            />
        </button>

        <!-- Backdrop — visible below md, only while the drawer is open. -->
        <Transition name="menu-sidebar-fade">
            <div
                v-if="isOpen"
                class="menu-sidebar__backdrop"
                aria-hidden="true"
                @click="handleBackdropClick"
            />
        </Transition>

        <!-- The aside itself.
             - At md and up it is a static sidebar; the trigger and backdrop
               are display:none and the drawer transform classes are no-ops.
             - Below md it is a fixed overlay drawer that slides in from the
               left when isOpen.
             - aria-hidden flips with isOpen below md so AT skips the closed
               drawer; above md the value is computed by the breakpoint CSS
               (the element is always interactive). -->
        <aside
            id="menu-sidebar-drawer"
            ref="drawerRef"
            class="menu-sidebar"
            :class="{ 'menu-sidebar--open': isOpen }"
            :aria-label="ariaLabel"
            :aria-hidden="isOpen ? undefined : 'true'"
            tabindex="-1"
            @keydown="trapFocusOnTab"
        >
            <ul
                class="menu-sidebar__list"
                role="list"
            >
                <li
                    v-for="(tab, index) in tabs"
                    :key="tab.id"
                    class="menu-sidebar__item"
                >
                    <RouterLink
                        v-if="tab.to"
                        :ref="(element) => setButtonRef(element, index)"
                        :to="tab.to"
                        class="menu-sidebar__tab"
                        :class="{ 'menu-sidebar__tab--active': tab.id === activeTab }"
                        :aria-current="tab.id === activeTab ? 'page' : undefined"
                        @click="selectTab(tab)"
                        @keydown="handleKeydown($event, index)"
                    >
                        {{ tab.label }}
                    </RouterLink>
                    <button
                        v-else
                        :ref="(element) => setButtonRef(element, index)"
                        type="button"
                        class="menu-sidebar__tab"
                        :class="{ 'menu-sidebar__tab--active': tab.id === activeTab }"
                        :aria-pressed="tab.id === activeTab ? 'true' : 'false'"
                        @click="selectTab(tab)"
                        @keydown="handleKeydown($event, index)"
                    >
                        {{ tab.label }}
                    </button>
                </li>
            </ul>
        </aside>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .menu-sidebar-root {
        @apply contents;
    }

    /* Hamburger trigger — visible below md only.
       Tap target meets the 44×44 floor from docs/ACCESSIBILITY.md. */
    .menu-sidebar__trigger {
        @apply inline-flex h-11 w-11 flex-col items-center justify-center gap-1
               rounded-md border border-white/40 bg-transparent text-white
               transition-colors motion-reduce:transition-none;
    }

    .menu-sidebar__trigger:focus-visible {
        @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-black;
    }

    @media (hover: hover) {
        .menu-sidebar__trigger:hover {
            @apply bg-white/10;
        }
    }

    .menu-sidebar__trigger-bar {
        @apply block h-0.5 w-5 rounded-full bg-white;
    }

    @media (min-width: 48rem) {
        .menu-sidebar__trigger {
            display: none;
        }
    }

    /* Backdrop — fixed full-viewport, dismisses the drawer on click.
       Hidden at md and up. */
    .menu-sidebar__backdrop {
        @apply fixed inset-0 z-40 bg-black/60;
    }

    @media (min-width: 48rem) {
        .menu-sidebar__backdrop {
            display: none;
        }
    }

    .menu-sidebar-fade-enter-active,
    .menu-sidebar-fade-leave-active {
        @apply transition-opacity duration-200 motion-reduce:transition-none;
    }

    .menu-sidebar-fade-enter-from,
    .menu-sidebar-fade-leave-to {
        @apply opacity-0;
    }

    /* The aside. Below md it's a fixed overlay drawer that slides in from
       the left; at md and up it's a normal in-flow sidebar. */
    .menu-sidebar {
        @apply fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[80vw]
               flex-col bg-black text-white shadow-xl outline-none
               transition-transform duration-200 ease-out
               motion-reduce:transition-none;
        transform: translateX(-100%);
    }

    .menu-sidebar--open {
        transform: translateX(0);
    }

    @media (min-width: 48rem) {
        .menu-sidebar {
            @apply relative inset-auto h-full w-full max-w-none flex-col
                   bg-transparent shadow-none;
            transform: none;
        }
    }

    .menu-sidebar__list {
        @apply flex flex-col gap-1 p-4;
    }

    @media (min-width: 48rem) {
        .menu-sidebar__list {
            @apply p-0;
        }
    }

    .menu-sidebar__item {
        @apply list-none;
    }

    /* The tab itself — full-width, left-aligned label.
       Inactive labels use text-white/80 (≈14:1 against pure black,
       comfortably above WCAG 1.4.3's 4.5:1 floor).
       Hover treatment is gated by Tailwind's hover variant which respects
       `@media (hover: hover)` in v4 by default, so touch devices skip it. */
    .menu-sidebar__tab {
        @apply relative block w-full rounded-md px-4 py-2 text-left
               text-sm font-medium text-white/80 no-underline
               transition-colors motion-reduce:transition-none
               hover:text-white
               focus-visible:outline-none focus-visible:ring-2
               focus-visible:ring-white focus-visible:ring-offset-2
               focus-visible:ring-offset-black;
    }

    /* Active-tab visual treatment — glass surface only (no left accent bar).
       Per resolved decision 2026-06-14. */
    .menu-sidebar__tab--active {
        @apply glass-surface text-white;
    }
</style>
