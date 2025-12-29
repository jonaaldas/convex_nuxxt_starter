<script setup lang="ts"></script>

<template>
  <div class="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <Card>
        <CardHeader class="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link. Please check your email to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent class="text-center">
          <p class="text-sm text-muted-foreground mb-4">
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
          <NuxtLink to="/login">
            <Button variant="outline"> Back to login </Button>
          </NuxtLink>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
