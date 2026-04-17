import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/error';

const prisma = new PrismaClient();

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    emailNotifications?: boolean;
  },
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      emailNotifications: data.emailNotifications,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phoneNumber: true, emailNotifications: true,
    },
  });
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User nicht gefunden');

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) throw new AppError(400, 'Aktuelles Passwort ist falsch');

  const hash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });
}

export async function updateInstructorSettings(
  userId: string,
  data: {
    cancellationDeadlineHours?: number;
    maxBookingsPerWeek?: number;
    reminderHoursBefore?: number;
  },
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role !== 'INSTRUCTOR') {
    throw new AppError(403, 'Nur Fahrlehrer können diese Einstellungen ändern');
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      cancellationDeadlineHours: data.cancellationDeadlineHours,
      maxBookingsPerWeek: data.maxBookingsPerWeek,
      reminderHoursBefore: data.reminderHoursBefore,
    },
    select: {
      cancellationDeadlineHours: true,
      maxBookingsPerWeek: true,
      reminderHoursBefore: true,
    },
  });
}

export async function savePushSubscription(userId: string, subscription: any) {
  await prisma.user.update({
    where: { id: userId },
    data: { pushSubscription: JSON.stringify(subscription) },
  });
}
