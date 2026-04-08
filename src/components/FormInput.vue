<script setup>
    import { computed } from "vue";

    const model = defineModel();
    const props = defineProps({
        type: {
            type: String,
            default: "text",
        },
        label: String,
        name: String,
        placeholder: String,
        required: {
            type: Boolean,
            default: true,
        },
    });

    const isValid = computed(() => {
        if (!props.required && isEmpty.value) {
            return true;
        }

        switch (props.type) {
            case "email":
                return validator.isEmail(model.value || "");
            case "tel":
                return validator.isMobilePhone(model.value || "", "any");
            default:
                return !isEmpty.value;
        }
    });
</script>

<template>
    <div class="field">
        <div class="field__content">
            <label class="field__label">
                {{ props.name }}
            </label>
            <div class="input__wrapper">
                <slot name="left"></slot>
                <input
                    v-model="model"
                    :type="props.type"
                    :inputmode="props.type === 'tel' ? 'numeric' : undefined"
                    :name="props.name"
                    class="field__input"
                    :placeholder="props.placeholder"
                    :required="props.required"
                />
                <slot name="right"></slot>
            </div>
        </div>
        <div class="field__errors">
            <slot name="error"></slot>
            <p class="message"></p>
        </div>
    </div>
</template>

<style scoped>
    @reference "#app.css";

    .field {
        @apply flex flex-col gap-2;
    }

    .field__content {
        @apply flex flex-col gap-2;
    }

    .field__label {
        @apply text-neutral-950 font-bold capitalize;

        @variant dark {
            @apply text-neutral-50;
        }
    }

    .input__wrapper {
        @apply bg-neutral-100 text-neutral-950 p-4 rounded-md border-b-8 border-neutral-200 flex flex-row gap-2;

        @variant dark {
            @apply bg-neutral-600 text-neutral-50 border-neutral-800;
        }
    }

    .field__input {
        @apply w-full;

        @variant focus {
            @apply outline-none;
        }
    }

    .field__errors {
        & > .message {
        }
    }
</style>
