import nodemailer from "nodemailer";
import { env } from "../config/env";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using SMTP credentials from the environment.
 * Used for forgot-password links and other transactional notifications.
 */
export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

export const passwordResetTemplate = (name: string, resetUrl: string): string => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your AKM LMS password. Click the button below to choose a new one. This link expires in ${env.RESET_TOKEN_EXPIRES_MIN} minutes.</p>
    <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Reset Password</a>
    <p>If you didn't request this, you can safely ignore this email.</p>
  </div>
`;
