<script setup>
    import { ref, onMounted } from "vue";
    import Button from "./Button.vue";
    import Link from "./Link.vue";

    const props = defineProps({});

    const items = ref({
        // name, description, url, image(s)
    });

    onMounted(() => {
        // TODO: Initialize items[0] as active, items[1] as next and items[5] as previous.
    });
</script>

<template>
    <div class="carousel">
        <div class="content">
            <!--
                1. Title
                2. Description
                3. URL
            -->
            <h2 class="heading">
                <span class="text-neutral-600 dark:text-neutral-400">01</span>
                Item Heading
            </h2>
            <p class="description">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati delectus sunt,
                repellendus sapiente optio neque saepe explicabo maxime enim debitis.
            </p>
            <div class="actions">
                <Button type="button">View on GitHub</Button>
                <Link to="#none">Learn More</Link>
            </div>
        </div>
        <div class="controls">
            <!-- Cube -->
        </div>
        <div class="gallery">
            <!--
                1. Next Item
                2. Active Item
                3. Previous Item
            -->
        </div>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .carousel {
    }

    .content {
        & > :where(:not(:first-child)) {
            @apply mt-8;
        }

        & > .heading {
            @apply text-balance;
        }

        & > .description {
            @apply text-balance;
        }
    }

    .controls {
    }

    .items {
    }
</style>
