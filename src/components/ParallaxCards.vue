<script setup>
    // TODO:
    // 1. Animate (Parallax) + Shifting on Hover to reveal
    // 2. Accept dataset from parent component.

    import { ref, onMounted } from "vue";
    import Card from "./Card.vue";

    const props = defineProps({});
    const cards = ref([]);

    onMounted(() => {
        cards.value = document.querySelectorAll(".card");

        const md = 48 * 16; // NOTE: Pixel value for TailwindCSS md: breakpoint.
        let { innerWidth, innerHeight } = window;
        let isActive = false;

        const activateEffects = () => {
            if (isActive) {
                return;
            }

            isActive = true;

            cards.value.forEach((card) => {
                card.addEventListener("mouseover", handleMouseOver);
                card.addEventListener("mouseout", handleMouseOut);
            });

            window.addEventListener("mousemove", handleMouseMove);
        };

        const deactivateEffects = () => {
            if (!isActive) {
                return;
            }

            isActive = false;

            cards.value.forEach((card) => {
                card.removeEventListener("mouseover", handleMouseOver);
                card.removeEventListener("mouseout", handleMouseOut);
                card.style.opacity = "1";
                card.style.transform = "";
            });

            window.removeEventListener("mousemove", handleMouseMove);
        };

        const handleMouseOver = (event) => {
            const card = event.currentTarget;
            cards.value.forEach((sibling) => {
                if (card !== sibling) {
                    sibling.style.opacity = "0.05";
                }
            });
        };

        const handleMouseOut = () => {
            cards.value.forEach((card) => {
                card.style.opacity = "1";
            });
        };

        const handleMouseMove = (event) => {
            const x = (event.clientX / innerWidth - 0.5) * 2;
            const y = (event.clientY / innerHeight - 0.5) * 2;

            cards.value.forEach((card, index) => {
                let vx = (cards.value.length - index) * 40;
                let vy = (cards.value.length - index) * 20;

                card.style.transform = `translateX(calc(${x * vx * -1}px)) translateY(calc(${y * vy}px))`;
            });
        };

        if (window.innerWidth >= md) {
            activateEffects();
        }

        window.addEventListener("resize", () => {
            innerWidth = window.innerWidth;
            innerHeight = window.innerHeight;

            if (window.innerWidth >= md) {
                activateEffects();
            } else {
                deactivateEffects();
            }
        });
    });
</script>

<template>
    <div class="parallax">
        <Card card-classes="bg-neutral-200"></Card>
        <Card card-classes="bg-neutral-400"></Card>
        <Card card-classes="bg-neutral-600"></Card>
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
            @apply z-3 -rotate-8 -translate-x-16 -translate-y-24;
        }

        & > *:nth-child(2) {
            @apply z-2 rotate-0 translate-x-16;
        }

        & > *:nth-child(3) {
            @apply z-1 rotate-8 -translate-x-4 translate-y-20;
        }
    }
</style>
