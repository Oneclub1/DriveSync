import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error';
import { sendInvitationEmail } from './email.service';

const prisma = new PrismaClient();

export async function createInvitation(instructorId: string, email: string) {
  // Prüfe ob der Instructor existiert
  const instructor = await prisma.user.findUnique({
    where: { id: instructorId },
  });

  if (!instructor || instructor.role !== 'INSTRUCTOR') {
    throw new AppError(403, 'Keine Berechtigung');
  }

  // Prüfe ob bereits eine aktive Einladung existiert
  const existing = await prisma.invitation.findFirst({
    where: {
      instructorId,
      email,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (existing) {
    throw new AppError(409, 'Es gibt bereits eine aktive Einladung für diese E-Mail');
  }

  // Prüfe ob der Schüler bereits registriert und zugeordnet ist
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const relation = await prisma.instructorLearner.findUnique({
      where: {
        instructorId_learnerId: {
          instructorId,
          learnerId: existingUser.id,
        },
      },
    });
    if (relation) {
      throw new AppError(409, 'Dieser Schüler ist bereits zugeordnet');
    }
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.invitation.create({
    data: {
      instructorId,
      email,
      token,
      expiresAt,
    },
  });

  // E-Mail senden
  const instructorName = `${instructor.firstName} ${instructor.lastName}`;
  await sendInvitationEmail(email, instructorName, token);

  return invitation;
}

export async function validateToken(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      instructor: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  if (!invitation || invitation.isUsed || invitation.expiresAt < new Date()) {
    return { valid: false, email: null, instructorName: null };
  }

  return {
    valid: true,
    email: invitation.email,
    instructorName: `${invitation.instructor.firstName} ${invitation.instructor.lastName}`,
  };
}

export async function getMyInvitations(instructorId: string) {
  return prisma.invitation.findMany({
    where: { instructorId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function revokeInvitation(instructorId: string, invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new AppError(404, 'Einladung nicht gefunden');
  }

  if (invitation.instructorId !== instructorId) {
    throw new AppError(403, 'Keine Berechtigung');
  }

  if (invitation.isUsed) {
    throw new AppError(400, 'Einladung wurde bereits verwendet');
  }

  await prisma.invitation.delete({ where: { id: invitationId } });
}
