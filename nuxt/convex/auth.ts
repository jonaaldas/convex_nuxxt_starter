import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { customSession } from 'better-auth/plugins';
import type { GenericActionCtx } from 'convex/server';
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import authConfig from './auth.config';
import storage from './cache/redis';
const siteUrl = process.env.SITE_URL! || 'http://localhost:3000';

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: true,
});

export const polarClient = new Polar({
  accessToken: 'polar_oat_CIi5S5FWrSEJNVDLsMGcLzx9WE9ADzV9cqyjb1oi9sh',
  server: 'sandbox',
});

const authOptions = {
  trustedOrigins: [siteUrl],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    crossDomain({ siteUrl }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: '82c8647b-93d7-4655-acd6-285a011ab7d8',
              slug: 'year',
            },
            {
              productId: '47cea88f-50a6-4e3b-8f15-694dd646e3d1',
              slug: 'month',
            },
          ],
          successUrl: `${siteUrl}/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: 'polar_whs_wvrd0RFOrNIytRVEE7S9avnsH9ZI8WdXr1L4837W6wP',
          onCustomerStateChanged: async (payload) => {
            console.log('Customer state changed', payload);
          },
          onOrderPaid: async (payload) => {
            console.log('Order paid', payload);
          },
          onPayload: async (payload) => {
            await storage.setItem(payload.type, payload);
          },
        }),
      ],
    }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
} satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>, { optionsOnly = false }: { optionsOnly?: boolean } = {}) => {
  const actionCtx = ctx as GenericActionCtx<DataModel>;

  return betterAuth({
    ...authOptions,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      ...authOptions.emailAndPassword,
      sendResetPassword: async ({ user, url }) => {
        await actionCtx.runMutation(internal.email.sendPasswordResetEmail, {
          to: user.email,
          url,
          userName: user.name,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await actionCtx.runMutation(internal.email.sendVerificationEmail, {
          to: user.email,
          url,
          userName: user.name,
        });
      },
    },
    plugins: [
      ...(authOptions.plugins ?? []),
      convex({ authConfig }),
      customSession(async ({ user, session }) => {
        try {
          const customers = await polarClient.customers.list({
            email: user.email,
            limit: 1,
          });

          const customer = customers.result.items[0];
          if (!customer) {
            return {
              user,
              session,
              activeSubscriptions: [],
              grantedBenefits: [],
              hasActiveSubscription: false,
            };
          }

          const customerState = await polarClient.customers.getState({
            id: customer.id,
          });

          return {
            user,
            session,
            activeSubscriptions: customerState.activeSubscriptions,
            grantedBenefits: customerState.grantedBenefits,
            hasActiveSubscription: customerState.activeSubscriptions.length > 0,
          };
        } catch (error) {
          console.error('[customSession] Failed to fetch customer state:', error);
          return {
            user,
            session,
            activeSubscriptions: [],
            grantedBenefits: [],
            hasActiveSubscription: false,
          };
        }
      }, authOptions),
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
