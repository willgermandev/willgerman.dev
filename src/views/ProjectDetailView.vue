<script setup>
    import { computed } from "vue";
    import { useRoute } from "vue-router";

    // NOTE: This array duplicates the placeholder record list owned by
    // feature/project-list-view. Cross-cutting concern — flagged in the plan for
    // extraction to src/data/projects.js once a second consumer lands. Do not
    // extend the list here without coordinating with the list view.
    const placeholderProjects = [
        {
            slug: "project-one",
            title: "Project One",
            subtitle: "A placeholder subtitle for the first project.",
            description:
                "A short placeholder description for the first project. Real content lands in a later round.",
        },
        {
            slug: "project-two",
            title: "Project Two",
            subtitle: "A placeholder subtitle for the second project.",
            description:
                "A short placeholder description for the second project. Real content lands in a later round.",
        },
        {
            slug: "project-three",
            title: "Project Three",
            subtitle: "A placeholder subtitle for the third project.",
            description:
                "A short placeholder description for the third project. Real content lands in a later round.",
        },
        {
            slug: "project-four",
            title: "Project Four",
            subtitle: "A placeholder subtitle for the fourth project.",
            description:
                "A short placeholder description for the fourth project. Real content lands in a later round.",
        },
        {
            slug: "project-five",
            title: "Project Five",
            subtitle: "A placeholder subtitle for the fifth project.",
            description:
                "A short placeholder description for the fifth project. Real content lands in a later round.",
        },
        {
            slug: "project-six",
            title: "Project Six",
            subtitle: "A placeholder subtitle for the sixth project.",
            description:
                "A short placeholder description for the sixth project. Real content lands in a later round.",
        },
        {
            slug: "project-seven",
            title: "Project Seven",
            subtitle: "A placeholder subtitle for the seventh project.",
            description:
                "A short placeholder description for the seventh project. Real content lands in a later round.",
        },
        {
            slug: "project-eight",
            title: "Project Eight",
            subtitle: "A placeholder subtitle for the eighth project.",
            description:
                "A short placeholder description for the eighth project. Real content lands in a later round.",
        },
    ];

    const route = useRoute();
    const project = computed(
        () => placeholderProjects.find((p) => p.slug === route.params.slug) ?? null,
    );
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
            <!-- TODO(project-list-view): switch to { name: 'project-list' } once that route registers -->
            <RouterLink
                to="/projects"
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
