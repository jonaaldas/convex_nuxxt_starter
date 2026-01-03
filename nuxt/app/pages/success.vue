<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { scheduleConfetti } = useConfetti();

const checkoutId = computed(() => route.query.checkout_id as string | undefined);

onMounted(async () => {
  // Give time for webhook to process and show the user feedback
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // Schedule confetti to fire on the settings page
  scheduleConfetti();

  // Redirect to settings page
  router.push('/dashboard/settings');
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
    <div class="flex flex-col items-center gap-4">
      <!-- Animated spinner -->
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

      <h1 class="text-2xl font-semibold">Confirming your payment...</h1>
      <p class="text-muted-foreground">Please wait while we process your subscription.</p>

      <p v-if="checkoutId" class="mt-4 text-xs text-muted-foreground/60">Checkout ID: {{ checkoutId }}</p>
    </div>
  </div>
</template>
