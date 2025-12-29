<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { authClient } from '../src/lib/auth-client';

const email = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  error.value = null;
  isLoading.value = true;

  const { error: resetError } = await authClient.requestPasswordReset({
    email: email.value,
    redirectTo: `${window.location.origin}/reset-password`,
  });

  isLoading.value = false;

  if (resetError) {
    error.value = resetError.message ?? 'Failed to send reset email';
    return;
  }

  success.value = true;
};

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader>
        <CardTitle>Reset your password</CardTitle>
        <CardDescription> Enter your email and we'll send you a reset link </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="success" class="text-center py-4">
          <p class="text-sm text-muted-foreground mb-4">
            If an account exists with that email, you'll receive a password reset link shortly.
          </p>
          <NuxtLink to="/login">
            <Button variant="outline"> Back to login </Button>
          </NuxtLink>
        </div>
        <form v-else @submit="handleSubmit">
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
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Sending...' : 'Send reset link' }}
              </Button>
              <FieldDescription class="text-center">
                Remember your password?
                <NuxtLink to="/login"> Sign in </NuxtLink>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
