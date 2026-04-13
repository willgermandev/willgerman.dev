<script setup>
    import { ref, watch, onMounted, useTemplateRef } from "vue";
    import Button from "./Button.vue";
    import Link from "./Link.vue";
    import data from "@/data/history.json";
    import { describe } from "vitest";

    const items = ref(
        data.map((item) => ({
            ...item,
            isActive: false,
        })),
    );

    const activeIndex = ref({});
    const activeItem = ref({});

    watch(
        items,
        () => {
            const index = items.value.findIndex((item) => item.isActive);

            activeIndex.value = index;
            activeItem.value = items.value[index];

            rotateCube(index);
            shiftGallery(index);
        },
        { deep: true },
    );

    const cube = useTemplateRef("cube");
    // NOTE: This could be updated from hardcoded positions to values that must be added in order to reach a desired outcome. Then use math to keep turning the cube.
    const position = [
        [-30, 45, 0],
        [-30, 135, 0],
        [-30, 135, -90],
        [-30, 225, -90],
        [-30, 315, -90],
        [-30, 315, 0],
    ];

    function rotateCube(target) {
        const faces = Array.from(cube.value.querySelectorAll(".face"));

        faces.forEach((face) => {
            face.classList.remove("active");
        });

        faces[target].classList.add("active");

        cube.value.style.transform = `
                rotateX(${position[target][0]}deg)
                rotateY(${position[target][1]}deg)
                rotateZ(${position[target][2]}deg)
            `;
    }

    const galleryItem = useTemplateRef("galleryItem");

    function shiftGallery(index) {
        const item = galleryItem.value;
        const currentIndex = item.dataset.index;

        item.classList.remove("active");
        item.classList.remove("reverse");
        void item.offsetWidth;

        if (index > currentIndex) {
            item.classList.add("active");
        }

        if (index < currentIndex) {
            item.classList.add("active");
            item.classList.add("reverse");
        }
    }

    onMounted(() => {
        items.value[0].isActive = true;
    });

    function setActiveItem(index) {
        items.value.forEach((item) => {
            item.isActive = false;
            if (items.value.indexOf(item) === index) {
                item.isActive = true;
            }
        });
    }
</script>

<template>
    <div class="carousel">
        <div class="content">
            <Transition
                name="header-scale"
                mode="out-in"
            >
                <h2
                    class="heading"
                    :key="activeItem?.id || activeIndex"
                >
                    <span class="text-primary-500">0{{ activeIndex + 1 }}</span>
                    {{ activeItem.title }}
                </h2>
            </Transition>
            <Transition
                name="description-scale"
                mode="out-in"
            >
                <p
                    class="description"
                    :key="activeItem?.id || activeIndex"
                >
                    {{ activeItem.description }}
                </p>
            </Transition>
            <Transition
                name="actions-scale"
                mode="out-in"
            >
                <div
                    class="actions"
                    v-if="activeItem.actions"
                    :key="activeItem?.id || activeIndex"
                >
                    <template
                        v-for="action in activeItem.actions"
                        :key="action.text"
                    >
                        <Button
                            v-if="action.type === 'button'"
                            type="button"
                        >
                            {{ action.text }}
                        </Button>

                        <Link
                            v-else
                            :to="action.url"
                        >
                            {{ action.text }}
                        </Link>
                    </template>
                </div>
            </Transition>
        </div>
        <div class="controls">
            <ul
                class="cube"
                ref="cube"
                role="list"
            >
                <template v-for="(item, index) in items">
                    <li class="face">
                        <button
                            type="button"
                            @click.stop.prevent="setActiveItem(index)"
                        >
                            {{ index + 1 }}
                        </button>
                    </li>
                </template>
            </ul>
        </div>
        <div class="gallery">
            <div
                class="gallery__item active"
                ref="galleryItem"
                :data-index="activeIndex"
            >
                {{ activeItem.image }}
            </div>
        </div>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .carousel {
        @apply grid grid-cols-1 md:grid-cols-2 md:gap-16 relative;
    }

    .content {
        & > :where(:not(:first-child)) {
            @apply mt-8;
        }

        & > .heading {
            @apply text-balance;
            transform-origin: left;
        }

        & > .description {
            @apply text-balance;
            transform-origin: left;
        }
    }

    .header-scale-enter-active,
    .header-scale-leave-active {
        transition: all 350ms;
    }

    .header-scale-enter-from,
    .header-scale-leave-to {
        opacity: 0;
        transform: scale(0);
    }

    .description-scale-enter-active,
    .description-scale-leave-active {
        transition: all 350ms;
        transition-delay: 100ms;
    }

    .description-scale-enter-from,
    .description-scale-leave-to {
        opacity: 0;
        transform: scale(0);
    }

    .controls {
        @apply w-max h-max p-12 bg-neutral-50 border-16 border-neutral-200 aspect-square rounded-full flex gap-0 justify-center items-center shadow-2xl fixed -bottom-4 left-1/2 -translate-x-1/2 scale-70 z-10 lg:absolute lg:bottom-50 lg:scale-85;

        @variant dark {
            @apply bg-neutral-900 border-neutral-800;
        }
    }

    .cube {
        --size: theme(spacing.16);
        --half: calc(var(--size) / 2);
        --border: calc(var(--size) / 32);

        @apply w-(--size) h-(--size) transform-3d relative;
        transition: all 200ms ease-in-out;

        & > .face {
            @apply w-(--size) h-(--size) flex gap-0 items-center justify-center bg-neutral-50 font-bold text-2xl absolute border-neutral-900 transition-all;

            border-width: var(--border);

            @variant hover {
                @apply bg-neutral-500 text-neutral-50;
            }

            @variant dark {
                @apply border-neutral-100;
            }

            & > button {
                @apply w-full h-full cursor-pointer;
            }
        }

        & > .face.active {
            @apply bg-neutral-900 text-neutral-50;

            @variant dark {
                @apply bg-neutral-50 text-neutral-950;
            }
        }

        & > .face--front,
        & > *:nth-child(1) {
            @apply bg-neutral-100 text-neutral-950;
            transform: translateZ(var(--half));

            @variant dark {
                @apply bg-neutral-900 text-neutral-50;
            }
        }

        & > .face--back,
        & > *:nth-child(4) {
            @apply bg-neutral-100 text-neutral-950;
            transform: rotateY(180deg) rotateZ(-90deg) translateZ(calc(var(--half) * 1));

            @variant dark {
                @apply bg-neutral-900 text-neutral-50;
            }
        }

        & > .face--left,
        & > *:nth-child(2) {
            @apply bg-neutral-200 text-neutral-950;
            transform: rotateY(-90deg) translateZ(var(--half));

            @variant dark {
                @apply bg-neutral-800 text-neutral-50;
            }
        }

        & > .face--right,
        & > *:nth-child(5) {
            @apply bg-neutral-200 text-neutral-950;
            transform: rotateX(-90deg) rotateZ(90deg) translateZ(var(--half));

            @variant dark {
                @apply bg-neutral-800 text-neutral-50;
            }
        }

        & > .face--top,
        & > *:nth-child(3) {
            @apply bg-neutral-300 text-neutral-950;
            transform: rotateX(90deg) rotateZ(90deg) translateZ(var(--half));

            @variant dark {
                @apply bg-neutral-700 text-neutral-50;
            }
        }

        & > .face--bottom,
        & > *:nth-child(6) {
            @apply bg-neutral-300 text-neutral-950;
            transform: rotateY(90deg) translateZ(var(--half));

            @variant dark {
                @apply bg-neutral-700 text-neutral-50;
            }
        }
    }

    .actions {
        @apply w-full flex flex-row flex-wrap gap-4 justify-start items-center my-16;
        transform-origin: left;
    }

    .actions-scale-enter-active,
    .actions-scale-leave-active {
        transition: all 350ms;
        transition-delay: 200ms;
    }

    .actions-scale-enter-from,
    .actions-scale-leave-to {
        opacity: 0;
        transform: scale(0);
    }

    .gallery {
        @apply w-3/4 aspect-1/1.25 pl-16 relative;
    }

    .gallery__item {
        @apply w-full h-full bg-neutral-950 text-neutral-50 lg:translate-x-16 rounded-lg;

        @variant dark {
            @apply bg-neutral-50 text-neutral-950;
        }
    }

    @keyframes shift {
        0% {
            transform: translateY(0);
            opacity: 1;
        }

        40% {
            opacity: 0;
        }

        49% {
            transform: translateY(-50%);
            opacity: 0;
        }

        51% {
            transform: translateY(50%);
            opacity: 0;
        }

        90% {
            opacity: 1;
        }

        100% {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .gallery__item.active {
        animation: shift 1s ease;
    }

    .gallery__item.active.reverse {
        animation: shift 1s ease reverse;
    }
</style>
