<script setup>
    import { ref } from "vue";

    const dialogRef = ref(null);

    const emit = defineEmits(["close", "cancel"]);

    function open() {
        dialogRef.value?.showModal();
    }

    function close(returnValue) {
        dialogRef.value?.close(returnValue);
    }

    defineExpose({ open, close });
</script>

<template>
    <dialog
        ref="dialogRef"
        @close="emit('close', $event.target.returnValue)"
        @cancel="emit('cancel')"
    ></dialog>
</template>

<style scoped>
    @reference "#app.css";
</style>
