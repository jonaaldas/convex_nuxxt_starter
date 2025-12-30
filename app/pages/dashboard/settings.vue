<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
});

const { user, userDisplayName } = useAuthStore();
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-4">
    <div class="text-lg">Settings</div>
    <div v-if="user" class="text-sm text-muted-foreground">
      Logged in as {{ userDisplayName }}
    </div>
  </div>
</template>
