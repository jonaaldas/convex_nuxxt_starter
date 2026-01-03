# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Finance Dashboard SaaS application built with Nuxt 4, Convex backend, Better-Auth authentication, and Polar payments. The main application code lives in the `nuxt/` subdirectory.

## Commands

All commands run from `nuxt/` directory:

```bash
cd nuxt

# Development
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:3000)

# Production
bun run build        # Build for production
bun run preview      # Preview production build

# Convex (run separately)
npx convex dev       # Start Convex dev server (syncs functions)
npx convex deploy    # Deploy to production
```

## Architecture

### Frontend (`nuxt/app/`)

- **Nuxt 4** SPA (SSR disabled) with file-based routing
- **shadcn-vue** (new-york style) components in `components/ui/`
- **Tailwind CSS 4** via Vite plugin
- Pages: landing, auth flows (login/register/forgot-password/reset-password/verification), dashboard, pricing, success

### Backend (`nuxt/convex/`)

- **Convex** serverless functions and database
- **Better-Auth** for authentication with email/password and Google OAuth
- **Polar** for subscription payments (monthly/yearly plans)
- **Upstash Redis** for caching customer state
- **Resend** for transactional emails

### Key Integration Points

- `convex/auth.ts` - Auth configuration with Polar integration, custom session adds subscription data
- `convex/http.ts` - HTTP routes for auth endpoints and Polar webhooks
- `app/src/lib/auth-client.ts` - Client-side auth with Better-Auth Vue
- `app/composables/useAuthStore.ts` - Auth state composable with subscription info
- `app/middleware/auth.ts` - Route protection for `/dashboard/*`

### Data Flow

1. Auth client (`auth-client.ts`) → Convex HTTP routes → Better-Auth → Convex database
2. Payments: Polar checkout → webhooks to `/polar/webhooks` → Redis cache sync
3. Session includes `activeSubscriptions`, `grantedBenefits`, `hasActiveSubscription` from Polar

## Environment Variables

Required in Convex dashboard and `.env`:

- `CONVEX_URL` - Convex deployment URL
- `SITE_URL` - Frontend URL for auth redirects
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth
- `RESEND_API_KEY` - Email service

## shadcn Components

Add new components:

```bash
npx shadcn-vue@latest add <component>
```

Components use Reka UI (headless) + Tailwind. No prefix configured, import directly from `@/components/ui/`.
