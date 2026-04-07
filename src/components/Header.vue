<script setup>
    import { ref } from "vue";

    import Button from "./Button.vue";
    import Link from "./Link.vue";

    const anchors = {
        "Who am I?": "#who-am-i",
        "My Work": "#my-work",
        "My Ponderings...": "#my-ponderings",
    };

    const isMenuOpen = ref(false);

    function toggleMenu() {
        isMenuOpen.value = !isMenuOpen.value;
    }
</script>

<template>
    <header class="header">
        <div class="header__content--mobile">
            <Link
                to="#none"
                class="header__logo"
            >
                Logo
            </Link>
            <button
                type="button"
                class="header__button"
                @click.stop.prevent="toggleMenu"
                :disabled="isMenuOpen"
            >
                ≡
            </button>
        </div>
        <div
            :class="[
                `header__content`,
                {
                    active: isMenuOpen,
                },
            ]"
        >
            <Link
                to="#none"
                class="header__logo hidden md:block"
            >
                Logo
            </Link>
            <button
                type="button"
                class="header__button header__button--close"
                @click.stop.prevent="toggleMenu"
                :disabled="!isMenuOpen"
            >
                ✘
            </button>
            <nav class="header__nav">
                <ul class="header__list">
                    <li v-for="(id, text) in anchors">
                        <Link
                            :to="id"
                            class="header__link"
                            >{{ text }}</Link
                        >
                    </li>
                </ul>
            </nav>
            <div class="header__actions">
                <!-- <button type="button" class="header__toggle">Theme Switcher</button> -->
                <Button type="button"> Let's Chat </Button>
            </div>
        </div>
    </header>
</template>

<style scoped>
    @reference "#app.css";

    .header {
        @apply relative overflow-y-scroll md:overflow-y-auto;
    }

    .header__logo {
        @apply p-4 m-0;
    }

    .header__content {
        @apply fixed top-0 right-0 min-w-xs min-h-full bg-neutral-100 shadow-lg py-20 translate-x-full md:static md:top-auto md:right-auto md:w-full md:min-w-auto md:min-h-auto md:bg-transparent md:shadow-none max-w-7xl flex flex-col md:flex-row justify-between items-center px-2 md:py-8 md:translate-x-0 mx-auto;
    }

    .header__content--mobile {
        @apply w-full max-w-7xl flex flex-row gap-2 justify-between items-center px-2 mx-auto md:hidden;
    }

    .header__content.active {
        @apply translate-x-0;
    }

    .header__list {
        @apply flex flex-col gap-8 items-center md:flex-row md:gap-2;
    }

    .header__link {
        @apply font-display text-base p-2 mx-0;
    }

    .header__button {
        @apply p-4 m-0 aspect-square text-2xl;

        @variant hover {
            @apply cursor-pointer;
        }

        @variant focus {
            @apply cursor-pointer;
        }
    }

    .header__button--close {
        @apply absolute top-0 right-2 md:hidden;
    }
</style>
