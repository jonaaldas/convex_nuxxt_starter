import { createClient, type GenericCtx } from '@convex-dev/better-auth';
import { convex, crossDomain } from '@convex-dev/better-auth/plugins';
import { components, internal } from './_generated/api';
import type { DataModel } from './_generated/dataModel';
import { query } from './_generated/server';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { admin, customSession } from 'better-auth/plugins';
import type { GenericActionCtx } from 'convex/server';
import { polar, checkout, portal, usage, webhooks } from '@polar-sh/better-auth';
import { Polar } from '@polar-sh/sdk';
import authConfig from './auth.config';
const siteUrl = process.env.SITE_URL! || 'http://localhost:3000';
const convexSiteUrl = process.env.CONVEX_SITE_URL!;

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!;
const LAUNCH_PRODUCT_ID = process.env.LAUNCH_PRODUCT_ID!;
const ADMIN_USER_IDS = ["k572tp2b2b215p0tr3zw4vynkd800gdh", "k573qcxcyfk9e61sbb5h46872n7zzz2g"]; // production, development admin users

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: true,
});

export const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.POLAR_SERVER! as 'production' | 'sandbox' ,
});

const authOptions = {
  baseURL: `${convexSiteUrl}/api/auth`,
  trustedOrigins: [siteUrl, convexSiteUrl],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    crossDomain({ siteUrl }),
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // OAuth callback goes directly to Convex, not through the proxy
      redirectURI: `${convexSiteUrl}/api/auth/callback/google`,
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
        await actionCtx.runAction(internal.emailActions.sendPasswordResetEmail, {
          to: user.email,
          url,
          userName: user.name,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await actionCtx.runAction(internal.emailActions.sendVerificationEmail, {
          to: user.email,
          url,
          userName: user.name,
        });
      },
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      callbackURL: `${siteUrl}/login`,
    },
    plugins: [
      ...(authOptions.plugins ?? []),
      admin({ adminUserIds: ADMIN_USER_IDS }),
      polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: LAUNCH_PRODUCT_ID,
                slug: 'launch',
              },
            ],
            successUrl: `${siteUrl}/success?checkout_id={CHECKOUT_ID}`,
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          webhooks({
            secret: POLAR_WEBHOOK_SECRET,
            onCustomerStateChanged: async (payload) => {
              try {
                const { id: customerId, email, activeSubscriptions } = payload.data;
                if (!email) {
                  console.error(`[POLAR WEBHOOK] No email for customer ${customerId}`);
                  return;
                }
                const isPaid = activeSubscriptions.length > 0;
                const isLaunchPrice = activeSubscriptions.some(
                  (sub: any) => sub.productId === LAUNCH_PRODUCT_ID,
                );
                await actionCtx.runMutation(internal.subscriptions.syncSubscriptionStatus, {
                  email,
                  polarCustomerId: customerId,
                  isPaid,
                  isLaunchPrice,
                });
                console.log(`[POLAR WEBHOOK] Synced: ${email} (paid=${isPaid}, launch=${isLaunchPrice})`);
              } catch (error) {
                console.error('[POLAR WEBHOOK] Failed to sync customer state:', error);
              }
            },
            onCustomerDeleted: async (payload) => {
              try {
                const { id: customerId, email } = payload.data;
                if (email) {
                  await actionCtx.runMutation(internal.subscriptions.syncSubscriptionStatus, {
                    email,
                    polarCustomerId: customerId,
                    isPaid: false,
                    isLaunchPrice: false,
                  });
                  console.log(`[POLAR WEBHOOK] Customer deleted: ${email}`);
                }
              } catch (error) {
                console.error('[POLAR WEBHOOK] Failed to handle deletion:', error);
              }
            },
          }),
        ],
      }),
      convex({ authConfig }),
      customSession(async ({ user, session }) => {
        const role = ADMIN_USER_IDS.includes(user.id) ? 'admin' as const : 'user' as const;

        try {
          const customers = await polarClient.customers.list({
            email: user.email,
            limit: 1,
          });

          let customer = customers.result.items[0];

          // Create Polar customer if doesn't exist (handles OAuth users who signed up before)
          if (!customer) {
            try {
              customer = await polarClient.customers.create({
                email: user.email,
                name: user.name || undefined,
                externalId: user.id,
              });
              console.log('[customSession] Created Polar customer for:', user.email);
            } catch (createError) {
              console.error('[customSession] Failed to create Polar customer:', createError);
              return {
                user,
                session,
                role,
                activeSubscriptions: [],
                grantedBenefits: [],
                hasActiveSubscription: false,
                isLaunchPrice: false,
              };
            }
          } else if (customer.externalId !== user.id) {
            // Ensure externalId is set — OAuth signups may not set it via createCustomerOnSignUp
            try {
              await polarClient.customers.update({
                id: customer.id,
                customerUpdate: {
                  externalId: user.id,
                },
              });
              console.log('[customSession] Linked Polar customer externalId for:', user.email);
            } catch (updateError) {
              console.error('[customSession] Failed to update externalId:', updateError);
            }
          }

          const customerState = await polarClient.customers.getState({
            id: customer.id,
          });

          const hasActiveSubscription = customerState.activeSubscriptions.length > 0;
          const isLaunchPrice = customerState.activeSubscriptions.some(
            (sub: any) => sub.productId === LAUNCH_PRODUCT_ID,
          );

          // Sync subscription status to Convex DB for future queries
          try {
            await actionCtx.runMutation(internal.subscriptions.syncSubscriptionStatus, {
              email: user.email,
              polarCustomerId: customer.id,
              isPaid: hasActiveSubscription,
              isLaunchPrice,
            });
          } catch (syncError) {
            console.error('[customSession] Failed to sync subscription status:', syncError);
          }

          return {
            user,
            session,
            role,
            activeSubscriptions: customerState.activeSubscriptions,
            grantedBenefits: customerState.grantedBenefits,
            hasActiveSubscription,
            isLaunchPrice,
          };
        } catch (error) {
          console.error('[customSession] Failed to fetch customer state:', error);
          return {
            user,
            session,
            role,
            activeSubscriptions: [],
            grantedBenefits: [],
            hasActiveSubscription: false,
            isLaunchPrice: false,
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
