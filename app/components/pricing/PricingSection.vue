<script setup lang="ts">
import type { PricingConfig, PricingPlan } from './types';
import { authClient } from '@/src/lib/auth-client';
import { toast } from 'vue-sonner';

const props = withDefaults(
  defineProps<{
    config: PricingConfig;
    columns?: 2 | 3 | 4;
  }>(),
  {
    columns: 3,
  }
);

const { isAuthenticated, hasActiveSubscription } = useAuthStore();

const loading = ref<string | null>(null);

const gridCols = computed(() => {
  switch (props.columns) {
    case 2:
      return 'md:grid-cols-2';
    case 4:
      return 'md:grid-cols-2 lg:grid-cols-4';
    default:
      return 'md:grid-cols-2 lg:grid-cols-3';
  }
});

async function handleSelectPlan(plan: PricingPlan) {
  if (!plan.productId) return;

  if (!isAuthenticated.value) {
    await navigateTo('/login');
    return;
  }

  if (hasActiveSubscription.value) {
    toast.info('You already have an active subscription', {
      description: 'Manage your subscription in settings.',
      action: {
        label: 'Go to Settings',
        onClick: () => navigateTo('/dashboard/settings'),
      },
    });
    return;
  }

  loading.value = plan.id;

  try {
    await authClient.checkout({
      products: [plan.productId],
      slug: plan.slug,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    toast.error('Checkout failed', {
      description: 'Please try again or contact support.',
    });
  } finally {
    loading.value = null;
  }
}
</script>

<template>
  <section class="py-16 md:py-24">
    <div class="container mx-auto px-4">
      <div class="mx-auto mb-12 max-w-3xl text-center md:mb-16">
        <p v-if="config.label" class="mb-4 text-sm font-medium uppercase tracking-wider text-primary">
          {{ config.label }}
        </p>
        <h2 class="mb-4 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          {{ config.title }}
        </h2>
        <p v-if="config.subtitle" class="text-lg text-muted-foreground">
          {{ config.subtitle }}
        </p>
      </div>

      <div :class="['grid gap-6', gridCols]">
        <PricingCard
          v-for="plan in config.plans"
          :key="plan.id"
          :plan="plan"
          :loading="loading === plan.id"
          @select="handleSelectPlan"
        />
      </div>
    </div>
  </section>
</template>
