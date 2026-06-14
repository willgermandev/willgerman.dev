<script setup>
    import { computed } from "vue";
    import { useRoute } from "vue-router";

    import { projects } from "@/data/projects.js";

    const route = useRoute();
    const project = computed(() => projects.find((p) => p.slug === route.params.slug) ?? null);
</script>

<template>
    <main
        id="main-content"
        class="mx-auto max-w-3xl px-6 py-16"
    >
        <template v-if="project">
            <h1 class="font-condensed text-5xl font-black uppercase tracking-wide">
                {{ project.title }}
            </h1>
            <p class="mt-4 font-light text-xl">
                {{ project.subtitle }}
            </p>
            <p class="mt-8 text-base leading-relaxed">
                {{ project.description }}
            </p>
        </template>
        <template v-else>
            <h1 class="font-condensed text-5xl font-black uppercase tracking-wide">
                Project not found
            </h1>
            <p class="mt-4 font-light text-xl">We couldn't find a project for that URL.</p>
        </template>
        <p class="mt-12">
            <RouterLink
                :to="{ name: 'project-list' }"
                class="underline underline-offset-4"
            >
                &larr; Back to projects
            </RouterLink>
        </p>
    </main>
</template>

<style scoped>
    @reference "#app.css";
</style>
