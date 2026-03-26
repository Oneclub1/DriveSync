import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export async function registerInstructor(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError(409, 'E-Mail bereits registriert');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'INSTRUCTOR',
      phoneNumber: data.phoneNumber,
    },
  });

  return generateAuthResponse(user);
}

export async function registerWithInvite(data: {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}) {
  const invitation = await prisma.invitation.findUnique({
    where: { token: data.token },
    include: { instructor: true },
  });

  if (!invitation || invitation.isUsed || invitation.expiresAt < new Date()) {
    throw new AppError(400, 'Einladung ungültig oder abgelaufen');
  }

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existing) {
    throw new AppError(409, 'E-Mail bereits registriert');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email: invitation.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'LEARNER',
        phoneNumber: data.phoneNumber,
      },
    });

    // Schüler dem Fahrlehrer zuordnen
    await tx.instructorLearner.create({
      data: {
        instructorId: invitation.instructorId,
        learnerId: newUser.id,
      },
    });

    // Einladung als benutzt markieren
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { isUsed: true, acceptedAt: new Date() },
    });

    return newUser;
  });

  return generateAuthResponse(user);
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError(401, 'Ungültige Anmeldedaten');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Ungültige Anmeldedaten');
  }

  return generateAuthResponse(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      phoneNumber: true,
      createdAt: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User nicht gefunden');
  }

  return user;
}

function generateAuthResponse(user: { id: string; email: string; role: string; firstName: string; lastName: string }) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: `${config.jwt.expirationHours}h` },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  };
}
