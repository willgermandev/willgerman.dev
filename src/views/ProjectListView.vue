<script setup>
    import ProjectCard from "@/components/ProjectCard.vue";
    import { projects } from "@/data/projects.js";
</script>

<template>
    <main
        id="main-content"
        class="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16"
    >
        <h1
            class="font-condensed mb-8 text-4xl font-black uppercase tracking-wide lg:mb-12 lg:text-6xl"
        >
            <!-- TBD content -->
            [Heading placeholder &mdash; TBD]
        </h1>
        <ul
            role="list"
            class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:grid-cols-4"
        >
            <li
                v-for="project in projects"
                :key="project.slug"
            >
                <ProjectCard
                    :slug="project.slug"
                    :title="project.title"
                    :subtitle="project.subtitle"
                    :thumbnail="project.thumbnail"
                    :thumbnail-alt="project.thumbnailAlt"
                />
            </li>
        </ul>
    </main>
</template>

<style scoped>
    @reference "#app.css";
</style>
