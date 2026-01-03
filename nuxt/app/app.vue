<template>
  <NuxtLoadingIndicator />
  <Toaster />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script lang="ts">
import 'vue-sonner/style.css';
import { Toaster } from '@/components/ui/sonner';
</script>
