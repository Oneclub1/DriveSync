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
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@drivesync.app',
  },
  appUrl: process.env.APP_URL || 'http://localhost:8100',
};
