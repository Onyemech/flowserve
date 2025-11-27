import nodemailer from 'nodemailer'
import { emailTemplates } from './templates'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
  
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Verify Your Email - FlowServe AI',
    html: emailTemplates.verification(name, verificationLink),
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
  
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Reset Your Password - FlowServe AI',
    html: emailTemplates.passwordReset(name, resetLink),
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: 'Welcome to FlowServe AI! 🎉',
    html: emailTemplates.welcome(name),
  })
}
