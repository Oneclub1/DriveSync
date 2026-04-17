import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/error';
import {
  notifyBookingCreated, notifyBookingCancelled, notifyBookingConfirmed,
} from './notification.service';

const prisma = new PrismaClient();

export async function bookSlot(learnerId: string, timeSlotId: string, notes?: string) {
  const slot = await prisma.timeSlot.findUnique({
    where: { id: timeSlotId },
    include: { booking: true },
  });

  if (!slot) {
    throw new AppError(404, 'Zeitfenster nicht gefunden');
  }

  if (!slot.isAvailable || slot.slotType !== 'LESSON') {
    throw new AppError(400, 'Zeitfenster ist nicht buchbar');
  }

  if (slot.booking && slot.booking.status !== 'CANCELLED') {
    throw new AppError(409, 'Zeitfenster ist bereits gebucht');
  }

  if (slot.startTime < new Date()) {
    throw new AppError(400, 'Zeitfenster liegt in der Vergangenheit');
  }

  // Prüfe ob Learner dem Instructor zugeordnet ist
  const relation = await prisma.instructorLearner.findUnique({
    where: {
      instructorId_learnerId: {
        instructorId: slot.instructorId,
        learnerId,
      },
    },
  });

  if (!relation) {
    throw new AppError(403, 'Du bist diesem Fahrlehrer nicht zugeordnet');
  }

  // Prüfe Wochenlimit (Instructor-Setting hat Vorrang)
  const instructor = await prisma.user.findUnique({
    where: { id: slot.instructorId },
    select: { maxBookingsPerWeek: true },
  });
  const maxPerWeek = instructor?.maxBookingsPerWeek ?? config.booking.maxBookingsPerWeek;

  const weekStart = new Date(slot.startTime);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const bookingsThisWeek = await prisma.booking.count({
    where: {
      learnerId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      timeSlot: {
        startTime: { gte: weekStart, lt: weekEnd },
      },
    },
  });

  if (bookingsThisWeek >= maxPerWeek) {
    throw new AppError(400, `Maximale Buchungen pro Woche erreicht (${maxPerWeek})`);
  }

  const created = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.create({
      data: { learnerId, timeSlotId, notes },
      include: {
        timeSlot: {
          include: {
            instructor: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    await tx.timeSlot.update({
      where: { id: timeSlotId },
      data: { isAvailable: false },
    });

    return booking;
  });

  // Async Notification (nicht warten)
  notifyBookingCreated(created.id).catch((e) => console.error('[Notify] Fehler:', e));

  return created;
}

export async function cancelBooking(learnerId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: true },
  });

  if (!booking) {
    throw new AppError(404, 'Buchung nicht gefunden');
  }

  if (booking.learnerId !== learnerId) {
    throw new AppError(403, 'Keine Berechtigung');
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError(400, 'Buchung ist bereits storniert');
  }

  if (booking.status === 'COMPLETED') {
    throw new AppError(400, 'Abgeschlossene Buchungen können nicht storniert werden');
  }

  // Per-Instructor Stornierungsfrist hat Vorrang vor Global-Setting
  const instructor = await prisma.user.findUnique({
    where: { id: booking.timeSlot.instructorId },
    select: { cancellationDeadlineHours: true },
  });
  const deadlineHours =
    instructor?.cancellationDeadlineHours ?? config.booking.cancellationDeadlineHours;

  const hoursUntilSlot = (booking.timeSlot.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
  const isFree = hoursUntilSlot >= deadlineHours;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationFee: !isFree,
      },
    });

    await tx.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { isAvailable: true },
    });

    return result;
  });

  // Async Notification an Instructor
  notifyBookingCancelled(bookingId, !isFree).catch((e) => console.error('[Notify] Fehler:', e));

  return {
    booking: updated,
    isFree,
    message: isFree
      ? 'Buchung erfolgreich storniert. Keine Kosten.'
      : `Stornierung zu spät (weniger als ${deadlineHours}h vorher). Die Fahrstunde muss trotzdem bezahlt werden.`,
  };
}

export async function getMyBookings(learnerId: string) {
  return prisma.booking.findMany({
    where: { learnerId },
    include: {
      timeSlot: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
    orderBy: { timeSlot: { startTime: 'desc' } },
  });
}

export async function getInstructorBookings(instructorId: string) {
  return prisma.booking.findMany({
    where: {
      timeSlot: { instructorId },
    },
    include: {
      learner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      timeSlot: true,
    },
    orderBy: { timeSlot: { startTime: 'desc' } },
  });
}

export async function confirmBooking(instructorId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { timeSlot: true },
  });

  if (!booking) {
    throw new AppError(404, 'Buchung nicht gefunden');
  }

  if (booking.timeSlot.instructorId !== instructorId) {
    throw new AppError(403, 'Keine Berechtigung');
  }

  if (booking.status !== 'PENDING') {
    throw new AppError(400, 'Nur ausstehende Buchungen können bestätigt werden');
  }

  const confirmed = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CONFIRMED' },
    include: {
      learner: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      timeSlot: true,
    },
  });

  notifyBookingConfirmed(bookingId).catch((e) => console.error('[Notify] Fehler:', e));
  return confirmed;
}
