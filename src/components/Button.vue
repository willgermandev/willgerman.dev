<script setup>
    const props = defineProps({
        type: {
            type: String,
            validator: (value) => ["submit", "button", "reset"].includes(value),
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
        :class="['btn']"
        :disabled="props.disabled"
    >
        <slot v-if="!props.loading"></slot>
        <span
            v-else
            class="loading loading-spinner"
        ></span>
    </button>
</template>

<style scoped>
    @reference "#app.css";
</style>
