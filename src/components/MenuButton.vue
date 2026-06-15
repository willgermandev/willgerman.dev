<script setup>
    import { computed } from "vue";
    import { RouterLink } from "vue-router";

    /**
     * MenuButton — a reusable, accessible menu-style button.
     *
     * Renders as a native `<button>` by default; switches to `<RouterLink>` (an
     * `<a href>`) when a `to` prop is supplied. Visual treatment is uppercase
     * text, a 1px white border, and a glassmorphic translucent-white surface.
     *
     * Props:
     *   - label    (String, required): visible button text; CSS uppercases it.
     *   - to       ([String, Object]): vue-router route location. Switches to link mode.
     *   - type     (String): native button type. Ignored in link mode. button|submit|reset.
     *   - disabled (Boolean): when true, renders `aria-disabled="true"`, applies the
     *                         disabled visual treatment, and (in link mode) prevents
     *                         navigation via `@click.prevent`. The native `disabled`
     *                         attribute is set only when rendering as `<button>`.
     *
     * Emits:
     *   - click (MouseEvent): forwarded from the rendered root.
     */
    const props = defineProps({
        label: {
            type: String,
            required: true,
        },
        to: {
            type: [String, Object],
            default: null,
        },
        type: {
            type: String,
            default: "button",
            validator: (value) => ["button", "submit", "reset"].includes(value),
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    });

    const emit = defineEmits(["click"]);

    const isLink = computed(() => props.to !== null);
    const renderedTag = computed(() => (isLink.value ? RouterLink : "button"));

    function handleClick(event) {
        if (props.disabled) {
            event.preventDefault();
            return;
        }
        emit("click", event);
    }
</script>

<template>
    <component
        :is="renderedTag"
        :to="isLink ? to : undefined"
        :type="isLink ? undefined : type"
        :disabled="!isLink && disabled ? true : undefined"
        :aria-disabled="disabled ? 'true' : undefined"
        class="menu-button"
        @click="handleClick"
    >
        {{ label }}
    </component>
</template>

<style scoped>
    @reference "#app.css";

    .menu-button {
        @apply glass-surface block w-full cursor-pointer rounded-md border border-white
            px-6 py-4 text-center text-lg font-semibold uppercase tracking-wide text-white
            no-underline transition-colors;
    }

    .menu-button:hover:not(:disabled):not([aria-disabled="true"]) {
        @apply bg-white/15;
    }

    .menu-button:focus-visible {
        @apply outline-none ring-2 ring-white ring-offset-2 ring-offset-black;
    }

    .menu-button:active:not(:disabled):not([aria-disabled="true"]) {
        @apply bg-white/25;
    }

    .menu-button:disabled,
    .menu-button[aria-disabled="true"] {
        @apply cursor-not-allowed opacity-50;
    }

    @media (prefers-reduced-motion: no-preference) {
        .menu-button {
            @apply transition-transform duration-150 ease-out;
        }

        .menu-button:hover:not(:disabled):not([aria-disabled="true"]) {
            @apply -translate-y-0.5;
        }

        .menu-button:active:not(:disabled):not([aria-disabled="true"]) {
            @apply translate-y-0 scale-[0.98];
        }
    }
</style>
