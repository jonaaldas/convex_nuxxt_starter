<script setup lang="ts">
import { authClient } from '@/src/lib/auth-client';
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});
const session = authClient.useSession();
console.log(session.value.data);
</script>

<template>
  <div class="flex flex-1 items-center justify-center">
    <div class="text-lg">Settings</div>
  </div>
</template>
