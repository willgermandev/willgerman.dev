<script setup>
    import { computed } from "vue";
    import Link from "./Link.vue";

    const years = computed(() => {
        return `2025-${new Date().getFullYear()}`;
    });

    const links = {
        GitHub: "https://github.com/willgermandev",
        LinkedIn: "https://www.linkedin.com/in/will-german-19b793370/",
        Indeed: "https://profile.indeed.com/p/willg-6w79hz8",
    };
</script>

<template>
    <footer class="footer">
        <div class="footer__content">
            <p class="footer__copyright">&copy; {{ years }} Will German. All Rights Reserved.</p>
            <nav>
                <ul class="footer__list">
                    <li
                        v-for="(url, platform) in links"
                        :key="platform"
                    >
                        <Link
                            :to="url"
                            class="footer__link"
                            >{{ platform }}</Link
                        >
                    </li>
                </ul>
            </nav>
        </div>
    </footer>
</template>

<style scoped>
    @reference "#app.css";

    .footer {
        @apply bg-neutral-950 text-neutral-50;
    }

    .footer__content {
        @apply w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center p-2 md:px-2 md:py-4 mx-auto;
    }

    .footer__copyright {
        @apply font-bold text-neutral-50 text-center sm:text-left;
    }

    .footer__list {
        @apply flex flex-row gap-2;
    }

    .footer__link {
        @apply text-neutral-50 p-2 m-0;
    }
</style>
