<script setup>
    import { ref, watch, onMounted, useTemplateRef } from "vue";
    import Button from "./Button.vue";
    import Link from "./Link.vue";
    import data from "@/data/history.json";

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
            <h2 class="heading">
                <span class="text-primary-500">0{{ activeIndex + 1 }}</span>
                {{ activeItem.title }}
            </h2>
            <p class="description">
                {{ activeItem.description }}
            </p>
            <div
                class="actions"
                v-if="activeItem.actions"
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
            <div class="gallery__item previous"></div>
            <div class="gallery__item current">
                {{ activeItem.image }}
            </div>
            <div class="gallery__item next"></div>
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
        }

        & > .description {
            @apply text-balance;
        }
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

    .items {
    }

    .actions {
        @apply w-full flex flex-row flex-wrap gap-4 justify-start items-center my-16;
    }

    .gallery {
        @apply w-3/4 aspect-1/1.25 pl-16 relative;
    }

    /* .gallery::after {
        content: "";
        @apply absolute top-1/2 left-1/2 w-screen h-screen bg-neutral-100 -translate-x-1/4 -translate-y-1/2 -z-1;
        clip-path: polygon(10% 0, 100% 0, 100% 100%, 10% 100%, 0 50%);
    } */

    .gallery__item {
        @apply w-full h-full bg-neutral-950 text-neutral-50 lg:translate-x-16 rounded-lg;

        @variant dark {
            @apply bg-neutral-50 text-neutral-950;
        }
    }

    .gallery__item.current {
    }

    .gallery__item.next {
        @apply hidden;
    }

    .gallery__item.previous {
        @apply hidden;
    }
</style>
