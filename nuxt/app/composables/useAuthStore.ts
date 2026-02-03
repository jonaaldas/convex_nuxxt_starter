import { useAuthClient } from '@/composables/auth';

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

// Singleton session ref - only on client to avoid SSR cross-request leakage
let _session: ReturnType<ReturnType<typeof useAuthClient>['useSession']> | null = null;

function getSession() {
  const authClient = useAuthClient();

  if (import.meta.client) {
    if (!_session) {
      _session = authClient.useSession();
    }
    return _session;
  }

  // On server, always create a fresh session ref per request
  return authClient.useSession();
}

export function useAuthStore() {
  const authClient = useAuthClient();
  const session = getSession();

  const user = computed(() => session.value.data?.user ?? null);
  const isAuthenticated = computed(() => !!session.value.data?.user);
  const isPending = computed(() => session.value.isPending);
  const error = computed(() => session.value.error);

  const activeSubscriptions = computed(() => session.value.data?.activeSubscriptions ?? []);
  const grantedBenefits = computed(() => session.value.data?.grantedBenefits ?? []);
  const hasActiveSubscription = computed(() => session.value.data?.hasActiveSubscription ?? false);
  const isLaunchPrice = computed(() => session.value.data?.isLaunchPrice ?? false);

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

  const role = computed(() => (session.value.data as any)?.role ?? 'user');
  const isAdmin = computed(() => role.value === 'admin');

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
    activeSubscriptions,
    grantedBenefits,
    hasActiveSubscription,
    isLaunchPrice,
    role,
    isAdmin,
  };
}
