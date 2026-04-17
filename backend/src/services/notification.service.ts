import { PrismaClient } from '@prisma/client';
import { sendEmail } from './email.service';
import { generateAIReminder } from './ai.service';
import { sendPushNotification } from './push.service';

const prisma = new PrismaClient();

export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED_FREE'
  | 'BOOKING_CANCELLED_FEE'
  | 'REMINDER'
  | 'INVITATION';

export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  bookingId?: string,
) {
  // In-App speichern
  await prisma.notification.create({
    data: { userId, type, title, message, bookingId },
  });

  // E-Mail (wenn aktiviert)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.emailNotifications) {
    await sendEmail(user.email, title, message);
  }

  // Push (wenn Subscription vorhanden)
  if (user?.pushSubscription) {
    try {
      await sendPushNotification(user.pushSubscription, title, message);
    } catch (e) {
      console.error('[Push] Fehler:', e);
    }
  }
}

export async function notifyBookingCreated(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      learner: true,
      timeSlot: { include: { instructor: true } },
    },
  });
  if (!booking) return;

  const dateStr = booking.timeSlot.startTime.toLocaleString('de-DE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  await notify(
    booking.timeSlot.instructorId,
    'BOOKING_CREATED',
    'Neue Buchung',
    `${booking.learner.firstName} ${booking.learner.lastName} hat eine Fahrstunde gebucht: ${dateStr}.`,
    bookingId,
  );
}

export async function notifyBookingConfirmed(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      learner: true,
      timeSlot: { include: { instructor: true } },
    },
  });
  if (!booking) return;

  const dateStr = booking.timeSlot.startTime.toLocaleString('de-DE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  await notify(
    booking.learnerId,
    'BOOKING_CONFIRMED',
    'Buchung bestätigt',
    `${booking.timeSlot.instructor.firstName} ${booking.timeSlot.instructor.lastName} hat deine Fahrstunde am ${dateStr} bestätigt.`,
    bookingId,
  );
}

export async function notifyBookingCancelled(bookingId: string, hadFee: boolean) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      learner: true,
      timeSlot: { include: { instructor: true } },
    },
  });
  if (!booking) return;

  const dateStr = booking.timeSlot.startTime.toLocaleString('de-DE', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const feeText = hadFee
    ? ' (Stornierungsgebühr fällt an, da innerhalb der Frist storniert wurde)'
    : '';

  await notify(
    booking.timeSlot.instructorId,
    hadFee ? 'BOOKING_CANCELLED_FEE' : 'BOOKING_CANCELLED_FREE',
    'Buchung storniert',
    `${booking.learner.firstName} ${booking.learner.lastName} hat die Fahrstunde am ${dateStr} storniert.${feeText}`,
    bookingId,
  );
}

export async function sendReminders() {
  // Finde alle bestätigten Buchungen, deren Slot in den nächsten 24h liegt
  // und für die noch kein Reminder verschickt wurde
  const now = new Date();
  const allUsers = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    select: { id: true, reminderHoursBefore: true },
  });

  const reminderMap = new Map<string, number>();
  allUsers.forEach((u) => reminderMap.set(u.id, u.reminderHoursBefore || 24));

  const upcoming = await prisma.booking.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      reminderSentAt: null,
      timeSlot: { startTime: { gt: now } },
    },
    include: {
      learner: true,
      timeSlot: { include: { instructor: true } },
    },
  });

  let sent = 0;
  for (const booking of upcoming) {
    const hoursBefore = reminderMap.get(booking.timeSlot.instructorId) || 24;
    const reminderTime = new Date(booking.timeSlot.startTime);
    reminderTime.setHours(reminderTime.getHours() - hoursBefore);

    if (reminderTime <= now) {
      const aiMessage = await generateAIReminder({
        learnerName: booking.learner.firstName,
        instructorName: `${booking.timeSlot.instructor.firstName} ${booking.timeSlot.instructor.lastName}`,
        startTime: booking.timeSlot.startTime,
        hoursBefore,
      });

      await notify(
        booking.learnerId,
        'REMINDER',
        'Erinnerung an deine Fahrstunde',
        aiMessage,
        booking.id,
      );

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSentAt: now },
      });
      sent++;
    }
  }

  return sent;
}

export async function getMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
