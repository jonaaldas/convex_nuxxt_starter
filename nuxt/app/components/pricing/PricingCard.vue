<script setup lang="ts">
import type { PricingPlan } from './types';
import { Check, X } from 'lucide-vue-next';

const props = defineProps<{
  plan: PricingPlan;
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [plan: PricingPlan];
}>();

const formattedPrice = computed(() => {
  if (props.plan.priceLabel) return props.plan.priceLabel;
  if (props.plan.price === 0) return '$0';
  return `$${props.plan.price}`;
});
</script>

<template>
  <Card :class="['relative flex flex-col', plan.featured && 'border-primary ring-1 ring-primary']">
    <CardHeader class="space-y-1">
      <div class="flex items-center justify-between">
        <CardTitle class="text-xl font-semibold">
          {{ plan.name }}
        </CardTitle>
        <Badge v-if="plan.badge" :variant="plan.featured ? 'default' : 'secondary'">
          {{ plan.badge }}
        </Badge>
      </div>
      <CardDescription class="min-h-12 text-sm">
        {{ plan.description }}
      </CardDescription>
    </CardHeader>

    <CardContent class="flex-1 space-y-6">
      <div>
        <div class="flex items-baseline gap-1">
          <span class="text-4xl font-bold tracking-tight">
            {{ formattedPrice }}
          </span>
          <span class="text-muted-foreground">/{{ plan.period }}</span>
        </div>
        <p v-if="plan.periodSubtext" class="mt-1 text-sm text-muted-foreground">
          {{ plan.periodSubtext }}
        </p>
      </div>

      <Button
        :variant="plan.buttonVariant || (plan.featured ? 'default' : 'outline')"
        class="w-full"
        :disabled="loading"
        @click="emit('select', plan)"
      >
        {{ plan.buttonText }}
      </Button>

      <Separator />

      <div class="space-y-3">
        <p class="text-sm font-medium">What you get</p>
        <ul class="space-y-2.5">
          <li v-for="(feature, index) in plan.features" :key="index" class="flex items-start gap-3 text-sm">
            <div
              :class="[
                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                feature.included ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              ]"
            >
              <Check v-if="feature.included" class="h-3 w-3" />
              <X v-else class="h-3 w-3" />
            </div>
            <span
              :class="[
                feature.included ? 'text-foreground' : 'text-muted-foreground line-through',
                feature.highlight && 'font-medium',
              ]"
            >
              {{ feature.text }}
            </span>
          </li>
        </ul>
      </div>
    </CardContent>
  </Card>
</template>
