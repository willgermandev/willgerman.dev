<script setup>
    import MenuButton from "@/components/MenuButton.vue";

    function handleQuit() {
        try {
            window.close();
        } catch {
            // window.close() throws in some environments; fall through to the info hint below.
        }
        // Browsers refuse window.close() on tabs not opened by window.open. Log a hint
        // for development; do not prompt or navigate the user.
        console.info("Tab close blocked by browser; please close this tab manually.");
    }
</script>

<template>
    <main
        id="main-content"
        class="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground"
    >
        <!-- TBD content -->
        <header class="mb-12 flex flex-col items-center text-center">
            <h1
                class="font-condensed text-balance text-6xl font-black tracking-wide sm:text-7xl lg:text-8xl"
            >
                [Title placeholder — TBD]
            </h1>
            <p class="font-sans text-balance mt-4 text-lg font-light text-foreground/80 sm:text-xl">
                [Heading placeholder — TBD]
            </p>
        </header>

        <nav
            class="flex w-11/12 flex-col gap-4 sm:w-1/2 md:w-1/3 lg:w-1/4"
            aria-label="Main menu"
        >
            <MenuButton
                label="START"
                :to="{ name: 'project-list' }"
            />
            <MenuButton
                label="SETTINGS"
                :to="{ name: 'settings' }"
            />
            <MenuButton
                label="QUIT"
                @click="handleQuit"
            />
        </nav>
    </main>
</template>

<style scoped>
    @reference "#app.css";
</style>
