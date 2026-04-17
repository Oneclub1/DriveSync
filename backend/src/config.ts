import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  jwt: {
    secret: process.env.JWT_SECRET || 'drivesync-dev-secret-change-in-production-min32chars!',
    expirationHours: parseInt(process.env.JWT_EXPIRATION_HOURS || '24'),
  },
  booking: {
    cancellationDeadlineHours: parseInt(process.env.CANCELLATION_DEADLINE_HOURS || '24'),
    maxBookingsPerWeek: parseInt(process.env.MAX_BOOKINGS_PER_WEEK || '3'),
    defaultLessonPriceEur: parseFloat(process.env.DEFAULT_LESSON_PRICE_EUR || '50'),
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@drivesync.app',
  },
  push: {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
  },
  ai: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
  appUrl: process.env.APP_URL || 'http://localhost:8100',
  reminderCronMinutes: parseInt(process.env.REMINDER_CRON_MINUTES || '10'),
};
