<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { authClient } from '../src/lib/auth-client';

const route = useRoute();
const token = computed(() => (route.query.token as string) || '');
const urlError = computed(() => route.query.error as string | undefined);

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  error.value = null;

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters';
    return;
  }

  isLoading.value = true;

  const { error: resetError } = await authClient.resetPassword({
    newPassword: password.value,
    token: token.value,
  });

  isLoading.value = false;

  if (resetError) {
    error.value = resetError.message ?? 'Failed to reset password';
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
        <CardTitle>Set new password</CardTitle>
        <CardDescription> Enter your new password below </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="success" class="text-center py-4">
          <p class="text-sm text-muted-foreground mb-4">Your password has been reset successfully.</p>
          <NuxtLink to="/login">
            <Button> Sign in </Button>
          </NuxtLink>
        </div>
        <div v-else-if="urlError === 'INVALID_TOKEN'" class="text-center py-4">
          <p class="text-sm text-destructive mb-4">This reset link is invalid or has expired.</p>
          <NuxtLink to="/forgot-password">
            <Button variant="outline"> Request new link </Button>
          </NuxtLink>
        </div>
        <div v-else-if="!token" class="text-center py-4">
          <p class="text-sm text-destructive mb-4">No reset token provided.</p>
          <NuxtLink to="/forgot-password">
            <Button variant="outline"> Request reset link </Button>
          </NuxtLink>
        </div>
        <form v-else @submit="handleSubmit">
          <FieldGroup>
            <Field v-if="error">
              <FieldError>{{ error }}</FieldError>
            </Field>
            <Field>
              <FieldLabel for="password"> New Password </FieldLabel>
              <Input id="password" v-model="password" type="password" required :disabled="isLoading" />
              <FieldDescription> Must be at least 8 characters </FieldDescription>
            </Field>
            <Field>
              <FieldLabel for="confirmPassword"> Confirm Password </FieldLabel>
              <Input id="confirmPassword" v-model="confirmPassword" type="password" required :disabled="isLoading" />
            </Field>
            <Field>
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Resetting...' : 'Reset password' }}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
