"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { sendEmail, FROM_NAME, FROM_EMAIL } from "./lib/ses";

// --- SES-based email (internalAction) — used by auth.ts ---

export const sendVerificationEmail = internalAction({
  args: {
    to: v.string(),
    url: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (_ctx, { to, url, userName }) => {
    await sendEmail({
      to,
      subject: "Verify your email address",
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111; margin-bottom: 24px;">Welcome${userName ? `, ${userName}` : ""}!</h1>
            <p style="margin-bottom: 16px;">Please verify your email address by clicking the button below:</p>
            <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${url}</p>
          </body>
        </html>
      `,
      text: `Welcome${userName ? `, ${userName}` : ""}! Please verify your email address by visiting: ${url}`,
    });
  },
});

export const sendPasswordResetEmail = internalAction({
  args: {
    to: v.string(),
    url: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (_ctx, { to, url, userName }) => {
    await sendEmail({
      to,
      subject: "Reset your password",
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111; margin-bottom: 24px;">Password Reset Request</h1>
            <p style="margin-bottom: 16px;">Hi${userName ? ` ${userName}` : ""},</p>
            <p style="margin-bottom: 16px;">We received a request to reset your password. Click the button below to choose a new password:</p>
            <a href="${url}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
            <p style="margin-top: 24px; color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="margin-top: 16px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${url}</p>
          </body>
        </html>
      `,
      text: `Hi${userName ? ` ${userName}` : ""}, We received a request to reset your password. Visit this link to reset: ${url}. This link will expire in 1 hour.`,
    });
  },
});

export const sendFeedbackEmail = internalAction({
  args: {
    title: v.string(),
    message: v.string(),
    userEmail: v.string(),
    userName: v.string(),
  },
  handler: async (_ctx, { title, message, userEmail, userName }) => {
    await sendEmail({
      to: "jonaaldas@gmail.com",
      subject: `Feedback: ${title}`,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #111; margin-bottom: 24px;">New Feedback</h1>
            <p style="margin-bottom: 8px;"><strong>From:</strong> ${userName} (${userEmail})</p>
            <p style="margin-bottom: 8px;"><strong>Subject:</strong> ${title}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
            <p style="white-space: pre-wrap;">${message}</p>
          </body>
        </html>
      `,
      text: `New Feedback\n\nFrom: ${userName} (${userEmail})\nSubject: ${title}\n\n${message}`,
    });
  },
});
