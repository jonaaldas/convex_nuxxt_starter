<script setup lang="ts">
import { authClient } from '~/src/lib/auth-client';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const { user, userDisplayName } = useAuthStore();

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
  </div>
</template>
