import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuth } from 'better-auth/minimal';
import type { GenericActionCtx } from 'convex/server';
import authConfig from './auth.config';

const siteUrl = process.env.SITE_URL!;
console.log('siteUrl', siteUrl);

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: true,
});

export const createAuth = (ctx: GenericCtx<DataModel>, { optionsOnly = false }: { optionsOnly?: boolean } = {}) => {
  const actionCtx = ctx as GenericActionCtx<DataModel>;

  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
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
    plugins: [crossDomain({ siteUrl }), convex({ authConfig })],
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
