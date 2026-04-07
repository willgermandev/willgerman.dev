<script setup>
    import { ref } from "vue";
    import Button from "./Button.vue";

    const props = defineProps({});
</script>

<template>
    <div>
        <form
            action=""
            method=""
            clas=""
        >
            <!--
                1. Name, Email, Subject, Message
            -->
        </form>
        <Button type="submit">Send It</Button>
    </div>
</template>

<style scoped>
    @reference "#app.css";
</style>
