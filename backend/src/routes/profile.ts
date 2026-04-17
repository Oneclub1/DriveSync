import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as profileService from '../services/profile.service';

export const profileRouter = Router();

profileRouter.use(verifyToken);

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  emailNotifications: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const settingsSchema = z.object({
  cancellationDeadlineHours: z.number().min(0).max(168).optional(),
  maxBookingsPerWeek: z.number().min(1).max(20).optional(),
  reminderHoursBefore: z.number().min(1).max(168).optional(),
});

const pushSubSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

// PATCH /api/profile - Profil aktualisieren
profileRouter.patch('/', async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await profileService.updateProfile(req.user!.userId, data);
    res.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// POST /api/profile/password - Passwort ändern
profileRouter.post('/password', async (req: AuthRequest, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);
    await profileService.changePassword(req.user!.userId, data.oldPassword, data.newPassword);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// PATCH /api/profile/settings - Instructor-spezifische Settings
profileRouter.patch('/settings', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    const data = settingsSchema.parse(req.body);
    const settings = await profileService.updateInstructorSettings(req.user!.userId, data);
    res.json(settings);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// POST /api/profile/push-subscription - Push-Subscription speichern
profileRouter.post('/push-subscription', async (req: AuthRequest, res, next) => {
  try {
    const sub = pushSubSchema.parse(req.body);
    await profileService.savePushSubscription(req.user!.userId, sub);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Ungültige Subscription' });
    }
    next(err);
  }
});
