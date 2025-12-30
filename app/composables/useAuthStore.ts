import { authClient } from '@/src/lib/auth-client';

export function getInitialsFromEmail(email: string): string {
  const username = email.split('@')[0] ?? '';
  const parts = username.split(/[._-]/);
  const first = parts[0]?.[0];
  const second = parts[1]?.[0];

  if (first && second) {
    return (first + second).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function useAuthStore() {
  const session = authClient.useSession();

  const user = computed(() => session.value.data?.user ?? null);
  const isAuthenticated = computed(() => !!session.value.data?.user);
  const isPending = computed(() => session.value.isPending);
  const error = computed(() => session.value.error);

  const userInitials = computed(() => {
    const email = user.value?.email;
    if (!email) return '';
    return getInitialsFromEmail(email);
  });

  const userDisplayName = computed(() => {
    return user.value?.name || user.value?.email || '';
  });

  const userAvatar = computed(() => {
    return user.value?.image || '';
  });

  async function signOut() {
    await authClient.signOut();
    await navigateTo('/');
  }

  async function refreshSession() {
    await authClient.getSession();
  }

  return {
    session,
    user,
    isAuthenticated,
    isPending,
    error,
    userInitials,
    userDisplayName,
    userAvatar,
    signOut,
    refreshSession,
  };
}
