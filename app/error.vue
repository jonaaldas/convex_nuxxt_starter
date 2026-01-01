<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();

const is404 = computed(() => props.error.statusCode === 404);

const handleError = () => clearError({ redirect: '/' });
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background px-4">
    <div class="text-center">
      <div class="relative mb-8">
        <span class="text-[12rem] font-black leading-none tracking-tighter text-muted-foreground/10 sm:text-[16rem]">
          {{ error.statusCode }}
        </span>
        <div class="absolute inset-0 flex items-center justify-center">
          <div v-if="is404" class="space-y-2 text-center">
            <div class="text-6xl">
              <span class="inline-block animate-bounce">🔍</span>
            </div>
          </div>
          <div v-else class="space-y-2 text-center">
            <div class="text-6xl">
              <span class="inline-block">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      <h1 class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {{ is404 ? 'Page not found' : 'Something went wrong' }}
      </h1>

      <p class="mx-auto mb-8 max-w-md text-lg text-muted-foreground">
        {{
          is404
            ? "Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist."
            : error.statusMessage || 'An unexpected error occurred. Please try again later.'
        }}
      </p>

      <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button size="lg" @click="handleError">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-2"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Home
        </Button>

        <Button variant="outline" size="lg" @click="$router.back()">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="mr-2"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Go Back
        </Button>
      </div>

      <p v-if="!is404 && error.statusMessage" class="mt-8 text-sm text-muted-foreground">
        Error: {{ error.statusMessage }}
      </p>
    </div>

    <div class="absolute bottom-8 text-center text-sm text-muted-foreground">
      <p>
        Need help?
        <a href="mailto:support@example.com" class="text-primary underline-offset-4 hover:underline">
          Contact Support
        </a>
      </p>
    </div>
  </div>
</template>
