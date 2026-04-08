<script setup>
    // NOTE: Intended for use inside of a ParallaxCards container.
    // TODO: Accept dataset from parent component.

    import { ref } from "vue";

    const props = defineProps({
        cardClasses: {
            type: String,
        },
    });
</script>

<template>
    <div class="container">
        <div :class="['card', props.cardClasses]">
            <slot />
        </div>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .container {
        @apply col-1 row-1 min-h-16 aspect-video;
    }

    .card {
        @apply w-full h-full rounded-lg shadow-xl transition-opacity duration-150 ease-[cubic-bezier(0.95,0.05,0.795,0.035)];
    }
</style>
