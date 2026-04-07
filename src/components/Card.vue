<script setup>
    // NOTE: Intended for use inside of a ParallaxCards container.
    // TODO: Accept dataset from parent component.

    import { ref } from "vue";

    const props = defineProps({});
</script>

<template>
    <div class="card"></div>
</template>

<style scoped>
    @reference "#app.css";

    .card {
        @apply col-1 row-1 min-h-16 aspect-video bg-neutral-200 rounded-lg shadow-2xl;
    }
</style>
