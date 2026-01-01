<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { authClient } from '../src/lib/auth-client';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

const handleLogin = async (e: Event) => {
  e.preventDefault();
  error.value = null;
  isLoading.value = true;

  const { error: signInError } = await authClient.signIn.email({
    email: email.value,
    password: password.value,
    callbackURL: `${window.location.origin}/dashboard`,
  });

  isLoading.value = false;

  if (signInError) {
    if (signInError.status === 403) {
      error.value = 'Please verify your email address';
    } else {
      error.value = signInError.message ?? 'Login failed';
    }
    return;
  }

  navigateTo('/verification');
};

const handleGoogleLogin = async () => {
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
        <CardTitle>Login to your account</CardTitle>
        <CardDescription> Enter your email below to login to your account </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleLogin">
          <FieldGroup>
            <Field v-if="error">
              <FieldError>{{ error }}</FieldError>
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
              <div class="flex items-center">
                <FieldLabel for="password"> Password </FieldLabel>
                <NuxtLink to="/forgot-password" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </NuxtLink>
              </div>
              <Input id="password" v-model="password" type="password" required :disabled="isLoading" />
            </Field>
            <Field>
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Logging in...' : 'Login' }}
              </Button>
              <Button variant="outline" type="button" :disabled="isLoading" @click="handleGoogleLogin">
                Login with Google
              </Button>
              <FieldDescription class="text-center">
                Don't have an account?
                <NuxtLink to="/register"> Sign up </NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
