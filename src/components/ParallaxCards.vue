<script setup>
    // TODO:
    // 1. Animate (Parallax) + Shifting on Hover to reveal
    // 2. Accept dataset from parent component.

    import { ref } from "vue";
    import Card from "./Card.vue";

    const props = defineProps({});
</script>

<template>
    <div class="parallax">
        <Card></Card>
        <Card></Card>
        <Card></Card>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .parallax {
        @apply min-h-96 md:min-h-auto h-full grid grid-cols-1 gap-0 content-center relative;

        & > * {
            @apply scale-70;
        }

        & > *:nth-child(1) {
            @apply bg-neutral-200 z-3 -rotate-8 -translate-x-16 -translate-y-24;
        }

        & > *:nth-child(2) {
            @apply bg-neutral-400 z-2 rotate-0 translate-x-16;
        }

        & > *:nth-child(3) {
            @apply bg-neutral-600 z-1 rotate-8 -translate-x-4 translate-y-20;
        }
    }
</style>
