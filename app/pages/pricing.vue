<script setup lang="ts">
import type { PricingConfig } from '~/components/pricing/types';

const pricingConfig: PricingConfig = {
  label: 'Pricing',
  title: 'Simple, transparent pricing',
  subtitle: 'Choose the plan that works for you. No hidden fees or locked-in contracts. Cancel or switch anytime.',
  plans: [
    {
      id: 'free',
      name: 'Free',
      description: 'The essentials to get started. Perfect for side projects and trying things out.',
      price: 0,
      period: 'mo',
      periodSubtext: 'Free forever',
      buttonText: 'Get started',
      buttonVariant: 'outline',
      features: [
        { text: 'Up to 3 projects', included: true },
        { text: 'Basic analytics', included: true },
        { text: 'Community support', included: true },
        { text: 'API access', included: false },
        { text: 'Custom integrations', included: false },
        { text: 'Priority support', included: false },
      ],
    },
    {
      id: 'monthly',
      name: 'Pro Monthly',
      description: 'Everything you need to scale your business. Built for growing teams.',
      price: 29,
      period: 'mo',
      periodSubtext: 'Billed monthly',
      badge: 'Popular',
      featured: true,
      buttonText: 'Start free trial',
      buttonVariant: 'default',
      productId: '47cea88f-50a6-4e3b-8f15-694dd646e3d1',
      slug: 'month',
      features: [
        { text: 'Unlimited projects', included: true, highlight: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Full API access', included: true },
        { text: 'Custom integrations', included: true },
        { text: 'Dedicated account manager', included: false },
      ],
    },
    {
      id: 'yearly',
      name: 'Pro Yearly',
      description: 'Best value for committed teams. Save 20% with annual billing.',
      price: 290,
      period: 'yr',
      periodSubtext: 'Billed annually (save $58)',
      badge: 'Best value',
      buttonText: 'Start free trial',
      buttonVariant: 'outline',
      productId: '82c8647b-93d7-4655-acd6-285a011ab7d8',
      slug: 'year',
      features: [
        { text: 'Everything in Pro Monthly', included: true, highlight: true },
        { text: 'Unlimited projects', included: true },
        { text: 'Advanced analytics', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Full API access', included: true },
        { text: 'Custom integrations', included: true },
      ],
    },
  ],
};
</script>

<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <NuxtLink to="/" class="text-xl font-bold">Logo</NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/login">
            <Button variant="ghost">Sign in</Button>
          </NuxtLink>
          <NuxtLink to="/register">
            <Button>Get Started</Button>
          </NuxtLink>
        </nav>
      </div>
    </header>

    <PricingSection :config="pricingConfig" />

    <section class="border-t bg-muted/50 py-16">
      <div class="container mx-auto px-4 text-center">
        <p class="text-sm text-muted-foreground">Enterprise</p>
        <h3 class="mb-4 text-2xl font-bold">Need custom pricing?</h3>
        <p class="mx-auto mb-6 max-w-xl text-muted-foreground">
          For larger teams with specific needs, we offer custom plans with dedicated support, custom integrations, and
          volume discounts.
        </p>
        <Button variant="outline" size="lg">Talk to our team</Button>
      </div>
    </section>
  </div>
</template>
