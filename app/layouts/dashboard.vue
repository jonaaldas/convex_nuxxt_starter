<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const { breadcrumbs } = useBreadcrumbs();
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                <BreadcrumbItem :class="{ 'hidden md:block': index < breadcrumbs.length - 1 }">
                  <BreadcrumbPage v-if="crumb.isCurrentPage">
                    {{ crumb.title }}
                  </BreadcrumbPage>
                  <BreadcrumbLink v-else as-child>
                    <NuxtLink :to="crumb.path">{{ crumb.title }}</NuxtLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  v-if="index < breadcrumbs.length - 1"
                  :class="{ 'hidden md:block': index < breadcrumbs.length - 2 }"
                />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
