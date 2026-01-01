<script setup lang="ts">
import { authClient } from '~/src/lib/auth-client';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const {
  session,
  user,
  userDisplayName,
  userInitials,
  userAvatar,
  isAuthenticated,
  isPending,
  error,
  activeSubscriptions,
  grantedBenefits,
  hasActiveSubscription,
} = useAuthStore();

const upgrade = async () => {
  await authClient.checkout({
    products: ['82c8647b-93d7-4655-acd6-285a011ab7d8'],
    slug: 'year',
  });
};
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-4">
    <div class="text-lg">Settings</div>
    <div v-if="user" class="text-sm text-muted-foreground">Logged in as {{ userDisplayName }}</div>
    <Button @click="upgrade"> Upgrade to Pro </Button>

    <div class="mt-8 w-full max-w-2xl space-y-4 rounded-lg border p-4">
      <h3 class="font-semibold">Auth Store Debug</h3>

      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="text-muted-foreground">isAuthenticated:</div>
        <div>{{ isAuthenticated }}</div>

        <div class="text-muted-foreground">isPending:</div>
        <div>{{ isPending }}</div>

        <div class="text-muted-foreground">error:</div>
        <div>{{ error }}</div>

        <div class="text-muted-foreground">userInitials:</div>
        <div>{{ userInitials }}</div>

        <div class="text-muted-foreground">userAvatar:</div>
        <div>{{ userAvatar || 'none' }}</div>

        <div class="text-muted-foreground">hasActiveSubscription:</div>
        <div>{{ hasActiveSubscription }}</div>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">activeSubscriptions:</div>
        <pre class="overflow-auto rounded bg-muted p-2 text-xs">{{ JSON.stringify(activeSubscriptions, null, 2) }}</pre>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">grantedBenefits:</div>
        <pre class="overflow-auto rounded bg-muted p-2 text-xs">{{ JSON.stringify(grantedBenefits, null, 2) }}</pre>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">session (full):</div>
        <pre class="max-h-64 overflow-auto rounded bg-muted p-2 text-xs">{{ JSON.stringify(session.data, null, 2) }}</pre>
      </div>

      <div class="space-y-2">
        <div class="text-sm text-muted-foreground">user:</div>
        <pre class="overflow-auto rounded bg-muted p-2 text-xs">{{ JSON.stringify(user, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>
