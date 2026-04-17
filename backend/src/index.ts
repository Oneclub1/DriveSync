import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './routes/auth';
import { slotsRouter } from './routes/slots';
import { bookingsRouter } from './routes/bookings';
import { invitationsRouter } from './routes/invitations';
import { studentsRouter } from './routes/students';
import { profileRouter } from './routes/profile';
import { statsRouter } from './routes/stats';
import { notificationsRouter } from './routes/notifications';
import { calendarRouter } from './routes/calendar';
import { paymentsRouter } from './routes/payments';
import { errorHandler } from './middleware/error';
import { sendReminders } from './services/notification.service';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/stats', statsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/payments', paymentsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`DriveSync API running on http://localhost:${config.port}`);

  // Reminder Cron-Job
  const intervalMs = config.reminderCronMinutes * 60 * 1000;
  console.log(`[Cron] Reminder-Check alle ${config.reminderCronMinutes} Minuten`);
  setInterval(async () => {
    try {
      const sent = await sendReminders();
      if (sent > 0) console.log(`[Cron] ${sent} Reminder verschickt`);
    } catch (e) {
      console.error('[Cron] Reminder-Fehler:', e);
    }
  }, intervalMs);
});

export default app;
