<script setup>
    import { ref } from "vue";
    import FormInput from "./FormInput.vue";
    import FormTextarea from "./FormTextarea.vue";
    import Button from "./Button.vue";
    import { WEB3FORMS_ACCESS_KEY } from "@/config";

    const key = ref(WEB3FORMS_ACCESS_KEY);
    const props = defineProps({});

    const name = ref("");
    const email = ref("");
    const subject = ref("");
    const message = ref("");
    const botcheck = ref("");

    async function submitForm() {
        if (botcheck.value) {
            return;
        }

        const url = "https://api.web3forms.com/submit";

        const payload = {
            access_key: key.value,
            botcheck: botcheck.value,
            name: name.value,
            email: email.value,
            subject: subject.value,
            message: message.value,
            // redirect: "http://localhost:5173/",
            from_name: "willgerman.dev",
        };

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        };

        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                // TODO: Confetti animation.
            }
        } else {
            // TODO: Display errors
        }
    }
</script>

<template>
    <form
        class="form"
        @submit.prevent="submitForm()"
    >
        <FormInput
            type="text"
            name="name"
            v-model="name"
            placeholder="John Smith"
            :required="true"
        />
        <FormInput
            type="email"
            name="email"
            v-model="email"
            placeholder="jsmith@example.com"
            :required="true"
        />
        <FormInput
            type="text"
            name="subject"
            v-model="subject"
            placeholder="Your Subject"
            :required="true"
        />
        <FormTextarea
            name="message"
            v-model="message"
            placeholder="Your Message"
            :required="true"
        />
        <input
            type="checkbox"
            name="botcheck"
            v-model="botcheck"
            style="display: none"
        />
        <Button type="submit">Send It</Button>
    </form>
</template>

<style scoped>
    @reference "#app.css";

    .form {
        @apply flex flex-col gap-4 py-4;

        & > .button {
            @apply py-4 mt-4;
        }
    }
</style>
