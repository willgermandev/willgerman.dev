<script setup>
    import { computed } from "vue";
    import { RouterLink } from "vue-router";

    defineOptions({
        inheritAttrs: false,
    });

    const props = defineProps({
        ...RouterLink.props,
    });

    const isExternalLink = computed(() => {
        return typeof props.to === "string" && props.to.startsWith("http");
    });
</script>

<template>
    <a
        v-if="isExternalLink"
        v-bind="$attrs"
        :href="to"
        class="link"
        target="_blank"
    >
        <slot></slot>
    </a>
    <RouterLink
        v-else
        v-bind="$props"
        v-slot="{ isActive, href, navigate }"
        custom
    >
        <a
            v-bind="$attrs"
            :href="href"
            :class="[
                'link',
                {
                    'link--active': isActive,
                },
            ]"
            @click="navigate"
        >
            <slot></slot>
        </a>
    </RouterLink>
</template>

<style scoped>
    @reference "#app.css";

    .link {
        @apply inline-block bg-transparent text-neutral-950 p-2 mx-6;

        @variant hover {
            @apply cursor-pointer;
        }

        @variant focus {
            @apply cursor-pointer outline-0;
        }

        @variant dark {
            @apply text-neutral-50;
        }
    }

    .link--active {
        @apply border-b-2 border-b-neutral-950;

        @variant dark {
            @apply border-b-neutral-50;
        }
    }
</style>
