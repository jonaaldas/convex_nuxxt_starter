import { v } from 'convex/values';
import { components } from './_generated/api';
import { Resend } from '@convex-dev/resend';
import { internalMutation } from './_generated/server';

export const resend = new Resend(components.resend, {
  testMode: false, // for now we are using birdseyesoftware.com for email verification
  apiKey: process.env.RESEND_API_KEY!,
});

export const sendVerificationEmail = internalMutation({
  args: {
    to: v.string(),
    url: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { to, url, userName }) => {
    await resend.sendEmail(ctx, {
      from: 'Company <noreply@birdseyesoftware.com>',
      to,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111; margin-bottom: 24px;">Welcome${userName ? `, ${userName}` : ''}!</h1>
            <p style="margin-bottom: 16px;">Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${url}</p>
          </body>
        </html>
      `,
    });
  },
});

export const sendPasswordResetEmail = internalMutation({
  args: {
    to: v.string(),
    url: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { to, url, userName }) => {
    await resend.sendEmail(ctx, {
      from: 'Company <noreply@birdseyesoftware.com>',
      to,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111; margin-bottom: 24px;">Password Reset Request</h1>
            <p style="margin-bottom: 16px;">Hi${userName ? ` ${userName}` : ''},</p>
            <p style="margin-bottom: 16px;">We received a request to reset your password. Click the button below to choose a new password:</p>
            <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${url}</p>
          </body>
        </html>
      `,
    });
  },
});
