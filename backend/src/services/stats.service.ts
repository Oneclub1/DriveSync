import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getInstructorStats(instructorId: string) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    studentsCount,
    totalSlots,
    upcomingBookings,
    bookingsThisWeek,
    bookingsThisMonth,
    cancelledThisMonth,
    completedThisYear,
    pendingBookings,
  ] = await Promise.all([
    prisma.instructorLearner.count({ where: { instructorId } }),
    prisma.timeSlot.count({ where: { instructorId } }),
    prisma.booking.count({
      where: {
        status: { in: ['PENDING', 'CONFIRMED'] },
        timeSlot: { startTime: { gt: now }, instructorId },
      },
    }),
    prisma.booking.count({
      where: {
        timeSlot: { instructorId, startTime: { gte: weekStart } },
      },
    }),
    prisma.booking.count({
      where: {
        timeSlot: { instructorId, startTime: { gte: monthStart } },
      },
    }),
    prisma.booking.count({
      where: {
        timeSlot: { instructorId },
        status: 'CANCELLED',
        cancelledAt: { gte: monthStart },
      },
    }),
    prisma.booking.count({
      where: {
        timeSlot: { instructorId, startTime: { gte: yearStart } },
        status: 'COMPLETED',
      },
    }),
    prisma.booking.count({
      where: {
        timeSlot: { instructorId },
        status: 'PENDING',
      },
    }),
  ]);

  // Buchungen pro Wochentag (letzte 30 Tage)
  const last30Days = new Date(now);
  last30Days.setDate(last30Days.getDate() - 30);

  const recentBookings = await prisma.booking.findMany({
    where: {
      timeSlot: { instructorId },
      bookedAt: { gte: last30Days },
    },
    select: { timeSlot: { select: { startTime: true } } },
  });

  const dayDistribution = [0, 0, 0, 0, 0, 0, 0]; // Sonntag-Samstag
  recentBookings.forEach((b) => {
    dayDistribution[new Date(b.timeSlot.startTime).getDay()]++;
  });

  // Stornierungsquote
  const totalCompletedOrCancelled = await prisma.booking.count({
    where: {
      timeSlot: { instructorId },
      status: { in: ['COMPLETED', 'CANCELLED'] },
    },
  });
  const totalCancelled = await prisma.booking.count({
    where: {
      timeSlot: { instructorId },
      status: 'CANCELLED',
    },
  });
  const cancellationRate =
    totalCompletedOrCancelled > 0
      ? Math.round((totalCancelled / totalCompletedOrCancelled) * 100)
      : 0;

  return {
    studentsCount,
    totalSlots,
    upcomingBookings,
    bookingsThisWeek,
    bookingsThisMonth,
    cancelledThisMonth,
    completedThisYear,
    pendingBookings,
    cancellationRate,
    dayDistribution,
  };
}

export async function getLearnerStats(learnerId: string) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    upcomingBookings,
    bookingsThisWeek,
    completedTotal,
    cancelledTotal,
    cancellationFees,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        learnerId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        timeSlot: { startTime: { gt: now } },
      },
    }),
    prisma.booking.count({
      where: {
        learnerId,
        status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
        timeSlot: { startTime: { gte: weekStart } },
      },
    }),
    prisma.booking.count({ where: { learnerId, status: 'COMPLETED' } }),
    prisma.booking.count({ where: { learnerId, status: 'CANCELLED' } }),
    prisma.booking.count({
      where: { learnerId, cancellationFee: true },
    }),
  ]);

  return {
    upcomingBookings,
    bookingsThisWeek,
    completedTotal,
    cancelledTotal,
    cancellationFees,
  };
}
