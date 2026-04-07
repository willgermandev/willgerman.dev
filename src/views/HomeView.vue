<script setup>
    import Button from "@/components/Button.vue";
    import Link from "@/components/Link.vue";
    import ParallaxCards from "@/components/ParallaxCards.vue";
</script>

<template>
    <main id="main-content">
        <section
            id="who-am-i"
            class="section"
        >
            <div class="section__content">
                <h1 class="heading">Big Section Title</h1>
                <p class="description">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius expedita facere
                    mollitia alias dolore similique exercitationem necessitatibus optio blanditiis,
                    delectus officiis fugit, tenetur, maiores error! Labore eaque autem consequuntur
                    hic.
                </p>
                <div class="section__actions">
                    <Button type="button">Let's Chat</Button>
                    <Link to="#none">Learn More</Link>
                </div>
            </div>
            <div class="section__graphics"></div>
        </section>
        <section
            id=""
            class="section"
        >
            <div class="section__content">
                <h2 class="heading">Big Section Title</h2>
                <p class="description">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius expedita facere
                    mollitia alias dolore similique exercitationem necessitatibus optio blanditiis,
                    delectus officiis fugit, tenetur, maiores error! Labore eaque autem consequuntur
                    hic.
                </p>
                <div class="section__actions">
                    <Button type="button">Let's Chat</Button>
                    <Link to="#none">Learn More</Link>
                </div>
            </div>
            <div class="section__graphics">
                <ParallaxCards></ParallaxCards>
            </div>
        </section>
        <section
            id="my-work"
            class="section"
        >
            <div class="section__content">
                <h2 class="heading">01 Timeline Title</h2>
                <p class="description">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius expedita facere
                    mollitia alias dolore similique exercitationem necessitatibus optio blanditiis,
                    delectus officiis fugit, tenetur, maiores error! Labore eaque autem consequuntur
                    hic.
                </p>
                <div class="section__actions">
                    <Button type="button">Let's Chat</Button>
                    <Link to="#none">Learn More</Link>
                </div>
            </div>
            <div class="section__graphics"></div>
        </section>
        <section
            id="lets-chat"
            class="section"
        >
            <div class="section__content wrapper">
                <h2 class="heading w-max mx-auto">Lets Chat</h2>
                <p class="description text-center">
                    Describe what the user needs to do to get in touch with me.
                </p>
            </div>
        </section>
    </main>
</template>

<style scoped>
    @reference "#app.css";

    .section {
        @apply grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 py-32 sm:py-48 md:py-64;
    }

    .section#who-am-i {
        @apply pt-8 sm:pt-16 md:pt-32;
    }

    .section#my-work {
        @apply relative;

        @variant dark {
            @apply border-neutral-50;
        }
    }

    .section#my-work::after {
        content: "";
        @apply absolute top-0 left-1/2 w-screen h-full -translate-x-1/2 border-y-16 border-neutral-100 pointer-events-none select-none;

        @variant dark {
            @apply border-neutral-900;
        }
    }

    .section#lets-chat {
        @apply grid-cols-1 md:grid-cols-1 relative;
    }

    .section#lets-chat::before,
    .section#lets-chat::after {
        content: "";
        @apply absolute top-0 left-1/2 w-screen h-full -translate-x-1/2 pointer-events-none select-none;
    }

    .section#lets-chat::before {
        @apply bg-neutral-200;
        clip-path: polygon(0 0, 100% 0, 100% 15%, 0 85%);

        @variant dark {
            @apply bg-neutral-700;
        }
    }

    .section#lets-chat::after {
        @apply bg-neutral-300;
        clip-path: polygon(0 85%, 100% 15%, 100% 100%, 0% 100%);

        @variant dark {
            @apply bg-neutral-800;
        }
    }

    .section__content {
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

    .section__actions {
        @apply w-max flex flex-row gap-4 justify-center items-center my-16;
    }

    .section__graphics {
    }

    .wrapper {
        @apply bg-neutral-50 p-8 sm:p-16 md:p-32 rounded-md shadow-xl;
    }
</style>
