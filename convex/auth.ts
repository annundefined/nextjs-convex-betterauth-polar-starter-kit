import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { createClient } from "@convex-dev/better-auth";
import { resend } from "./email";

export const authComponent = createClient<DataModel>(
  // Component access requires any cast due to Convex component type generation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (components as any).betterAuth
);

export const createAuth = (
  // BetterAuth requires a flexible context type that works with both query and action contexts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL ?? "http://localhost:3000",
    trustedOrigins: [process.env.SITE_URL ?? "http://localhost:3000"],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const name = user.name || user.email.split("@")[0];
        // TODO: Update the "from" email with your verified domain, otherwise you can only test with your resend account email
        await resend.sendEmail(ctx, {
          from: process.env.EMAIL_FROM ?? "My App <onboarding@resend.dev>",
          to: user.email,
          subject: "Verify your email address",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; font-size: 24px;">Verify your email</h1>
              <p style="color: #666; font-size: 16px;">Hello ${name},</p>
              <p style="color: #666; font-size: 16px;">Click the button below to verify your email address.</p>
              <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
              <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        const name = user.name || user.email.split("@")[0];
        // Convex requires awaiting - unawaited operations won't run
        await resend.sendEmail(ctx, {
          from: process.env.EMAIL_FROM ?? "My App <onboarding@resend.dev>",
          to: user.email,
          subject: "Reset your password",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #333; font-size: 24px;">Reset your password</h1>
              <p style="color: #666; font-size: 16px;">Hello ${name},</p>
              <p style="color: #666; font-size: 16px;">Click the button below to reset your password.</p>
              <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
              <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({
          user,
          newEmail,
          url,
        }: {
          user: { name?: string; email: string };
          newEmail: string;
          url: string;
        }) => {
          const name = user.name || user.email.split("@")[0];
          await resend.sendEmail(ctx, {
            from: process.env.EMAIL_FROM ?? "My App <onboarding@resend.dev>",
            to: user.email,
            subject: "Confirm email change",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; font-size: 24px;">Confirm email change</h1>
                <p style="color: #666; font-size: 16px;">Hello ${name},</p>
                <p style="color: #666; font-size: 16px;">Click the button below to confirm changing your email to ${newEmail}.</p>
                <a href="${url}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Confirm Email Change</a>
                <p style="color: #999; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
              </div>
            `,
          });
        },
      },
    },
    plugins: [nextCookies(), convex()],
  });
};
