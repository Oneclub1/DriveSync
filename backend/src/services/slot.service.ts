import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export async function createSlot(instructorId: string, data: {
  startTime: string;
  endTime: string;
  slotType?: string;
}) {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  if (endTime <= startTime) {
    throw new AppError(400, 'Endzeit muss nach Startzeit liegen');
  }

  if (startTime < new Date()) {
    throw new AppError(400, 'Startzeit muss in der Zukunft liegen');
  }

  // Prüfe Überschneidungen mit bestehenden Slots
  const overlapping = await prisma.timeSlot.findFirst({
    where: {
      instructorId,
      AND: [
        { startTime: { lt: endTime } },
        { endTime: { gt: startTime } },
      ],
    },
  });

  if (overlapping) {
    throw new AppError(409, 'Zeitfenster überschneidet sich mit einem bestehenden Slot');
  }

  return prisma.timeSlot.create({
    data: {
      instructorId,
      startTime,
      endTime,
      slotType: data.slotType || 'LESSON',
    },
  });
}

export async function createBulkSlots(instructorId: string, data: {
  startTime: string;
  endTime: string;
  slotType?: string;
  repeatWeeks?: number;
}) {
  const slots = [];
  const weeks = data.repeatWeeks || 1;

  for (let i = 0; i < weeks; i++) {
    const start = new Date(data.startTime);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(data.endTime);
    end.setDate(end.getDate() + i * 7);

    slots.push(
      await createSlot(instructorId, {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        slotType: data.slotType,
      }),
    );
  }

  return slots;
}

export async function deleteSlot(instructorId: string, slotId: string) {
  const slot = await prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: { booking: true },
  });

  if (!slot) {
    throw new AppError(404, 'Zeitfenster nicht gefunden');
  }

  if (slot.instructorId !== instructorId) {
    throw new AppError(403, 'Keine Berechtigung');
  }

  if (slot.booking && slot.booking.status !== 'CANCELLED') {
    throw new AppError(409, 'Zeitfenster hat eine aktive Buchung');
  }

  await prisma.timeSlot.delete({ where: { id: slotId } });
}

export async function getMySlots(instructorId: string, from?: string, to?: string) {
  const where: any = { instructorId };

  if (from) where.startTime = { ...where.startTime, gte: new Date(from) };
  if (to) where.startTime = { ...where.startTime, lte: new Date(to) };

  return prisma.timeSlot.findMany({
    where,
    include: {
      booking: {
        include: {
          learner: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });
}

export async function getAvailableSlots(learnerId: string, from?: string, to?: string) {
  // Finde alle Instructors des Learners
  const relations = await prisma.instructorLearner.findMany({
    where: { learnerId },
    select: { instructorId: true },
  });

  const instructorIds = relations.map((r) => r.instructorId);

  if (instructorIds.length === 0) {
    return [];
  }

  const where: any = {
    instructorId: { in: instructorIds },
    isAvailable: true,
    slotType: 'LESSON',
    startTime: { gt: new Date() },
    booking: null, // Nur ungebuchte Slots
  };

  if (from) where.startTime = { ...where.startTime, gte: new Date(from) };
  if (to) where.startTime = { ...where.startTime, lte: new Date(to) };

  return prisma.timeSlot.findMany({
    where,
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { startTime: 'asc' },
  });
}
