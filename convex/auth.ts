import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuth } from 'better-auth/minimal';
import type { GenericActionCtx } from 'convex/server';
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import authConfig from './auth.config';

const siteUrl = process.env.SITE_URL!;
console.log('siteUrl', siteUrl);

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: true,
});
const polarClient = new Polar({
  accessToken: 'polar_oat_CIi5S5FWrSEJNVDLsMGcLzx9WE9ADzV9cqyjb1oi9sh', //new //test token from eazy invoice.
  server: 'sandbox',
});

export const createAuth = (ctx: GenericCtx<DataModel>, { optionsOnly = false }: { optionsOnly?: boolean } = {}) => {
  const actionCtx = ctx as GenericActionCtx<DataModel>;

  return betterAuth({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
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
      crossDomain({ siteUrl }),
      convex({ authConfig }),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: '82c8647b-93d7-4655-acd6-285a011ab7d8', // ID of Product from Polar Dashboard
                slug: 'year', // Custom slug for easy reference in Checkout URL, e.g. /checkout/pro
              },
              {
                productId: '47cea88f-50a6-4e3b-8f15-694dd646e3d1',
                slug: 'month',
              },
            ],
            successUrl: '/success?checkout_id={CHECKOUT_ID}',
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET!,
            onCustomerStateChanged: async (payload) => {
              console.log('Customer state changed', payload);
            },
            onOrderPaid: async (payload) => {
              console.log('Order paid', payload);
            },
            onPayload: async (payload) => {
              console.log('Payload', payload);
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
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
