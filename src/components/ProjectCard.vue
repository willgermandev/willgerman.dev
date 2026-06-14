<script setup>
    defineProps({
        title: {
            type: String,
            required: true,
        },
        subtitle: {
            type: String,
            default: "",
        },
        slug: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            default: "",
        },
        thumbnailAlt: {
            type: String,
            default: "",
        },
    });
</script>

<template>
    <RouterLink
        :to="`/projects/${slug}`"
        class="project-card group block aspect-[5/7] overflow-hidden rounded-md bg-gray-900 text-white no-underline transition-colors duration-150 hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
    >
        <div class="relative flex h-full w-full flex-col justify-end">
            <img
                v-if="thumbnail"
                :src="thumbnail"
                :alt="thumbnailAlt"
                class="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div
                v-else
                aria-hidden="true"
                class="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-950"
            />
            <div
                class="relative flex flex-col gap-1 bg-linear-to-t from-black/80 to-transparent p-4 pt-12"
            >
                <h3
                    class="font-heading text-2xl leading-tight font-semibold uppercase tracking-wide"
                >
                    {{ title }}
                </h3>
                <p
                    v-if="subtitle"
                    class="text-sm text-gray-200"
                >
                    {{ subtitle }}
                </p>
            </div>
        </div>
    </RouterLink>
</template>

<style scoped>
    @reference "#app.css";
</style>
