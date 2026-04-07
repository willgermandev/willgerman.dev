<script setup>
    const props = defineProps({
        type: {
            type: String,
            validator: (value) => ["submit", "button", "reset"].includes(value),
        },
        styles: {
            type: String,
            default: "",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    });
</script>

<template>
    <button
        :type="props.type"
        :class="[
            'button',
            props.styles,
            {
                'button--loading': props.loading,
            },
        ]"
        :disabled="props.disabled"
    >
        <slot></slot>
    </button>
</template>

<style scoped>
    @reference "#app.css";

    .button {
        @apply bg-neutral-800 text-neutral-50 font-bold px-8 py-2 border-b-8 border-b-neutral-950 rounded-sm transition duration-150;

        @variant hover {
            @apply scale-110 cursor-pointer;
        }

        @variant focus {
            @apply scale-110 cursor-pointer outline-0;
        }

        @variant dark {
            @apply bg-neutral-50 border-b-neutral-200 text-neutral-950;
        }
    }

    .button--loading {
        @variant dark {
        }
    }

    .button[disabled] {
        @variant dark {
        }
    }
</style>
