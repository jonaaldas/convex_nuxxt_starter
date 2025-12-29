<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { authClient } from '../src/lib/auth-client';

const name = ref('');
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

const handleRegister = async (e: Event) => {
  e.preventDefault();
  error.value = null;
  isLoading.value = true;

  const { error: signUpError } = await authClient.signUp.email({
    name: name.value,
    email: email.value,
    password: password.value,
  });

  isLoading.value = false;

  if (signUpError) {
    error.value = signUpError.message ?? 'Registration failed';
    return;
  }

  navigateTo('/verification');
};

const handleGoogleSignUp = async () => {
  error.value = null;
  isLoading.value = true;

  await authClient.signIn.social({
    provider: 'google',
  });
};

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription> Enter your details below to create your account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleRegister">
          <FieldGroup>
            <Field v-if="error">
              <FieldError>{{ error }}</FieldError>
            </Field>
            <Field>
              <FieldLabel for="name"> Name </FieldLabel>
              <Input
                id="name"
                v-model="name"
                type="text"
                placeholder="John Doe"
                required
                :disabled="isLoading"
              />
            </Field>
            <Field>
              <FieldLabel for="email"> Email </FieldLabel>
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="m@example.com"
                required
                :disabled="isLoading"
              />
            </Field>
            <Field>
              <FieldLabel for="password"> Password </FieldLabel>
              <Input id="password" v-model="password" type="password" required :disabled="isLoading" />
              <FieldDescription> Must be at least 8 characters </FieldDescription>
            </Field>
            <Field>
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Creating account...' : 'Create account' }}
              </Button>
              <Button variant="outline" type="button" :disabled="isLoading" @click="handleGoogleSignUp">
                Sign up with Google
              </Button>
              <FieldDescription class="text-center">
                Already have an account?
                <NuxtLink to="/login"> Sign in </NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
