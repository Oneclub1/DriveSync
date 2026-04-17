import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getStudents(instructorId: string) {
  const relations = await prisma.instructorLearner.findMany({
    where: { instructorId },
    include: {
      learner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          createdAt: true,
        },
      },
    },
    orderBy: { assignedAt: 'desc' },
  });

  // Statistiken pro Schüler
  const enrichedStudents = await Promise.all(
    relations.map(async (rel) => {
      const totalBookings = await prisma.booking.count({
        where: { learnerId: rel.learnerId },
      });
      const completedBookings = await prisma.booking.count({
        where: { learnerId: rel.learnerId, status: 'COMPLETED' },
      });
      const cancelledBookings = await prisma.booking.count({
        where: { learnerId: rel.learnerId, status: 'CANCELLED' },
      });
      const upcomingBookings = await prisma.booking.count({
        where: {
          learnerId: rel.learnerId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          timeSlot: { startTime: { gt: new Date() } },
        },
      });

      return {
        ...rel.learner,
        assignedAt: rel.assignedAt,
        stats: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          upcoming: upcomingBookings,
        },
      };
    }),
  );

  return enrichedStudents;
}

export async function removeStudent(instructorId: string, learnerId: string) {
  await prisma.instructorLearner.delete({
    where: {
      instructorId_learnerId: { instructorId, learnerId },
    },
  });
}
