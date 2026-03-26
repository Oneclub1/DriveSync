import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/auth';
import * as authService from '../services/auth.service';
import { AppError } from '../middleware/error';

export const authRouter = Router();

const registerInstructorSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  firstName: z.string().min(1, 'Vorname erforderlich'),
  lastName: z.string().min(1, 'Nachname erforderlich'),
  phoneNumber: z.string().optional(),
});

const registerWithInviteSchema = z.object({
  token: z.string().min(1, 'Token erforderlich'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  firstName: z.string().min(1, 'Vorname erforderlich'),
  lastName: z.string().min(1, 'Nachname erforderlich'),
  phoneNumber: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(1, 'Passwort erforderlich'),
});

// POST /api/auth/register-instructor - Fahrlehrer-Registrierung (öffentlich)
authRouter.post('/register-instructor', async (req, res, next) => {
  try {
    const data = registerInstructorSchema.parse(req.body);
    const result = await authService.registerInstructor(data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// POST /api/auth/register-with-invite - Schüler-Registrierung via Einladung
authRouter.post('/register-with-invite', async (req, res, next) => {
  try {
    const data = registerWithInviteSchema.parse(req.body);
    const result = await authService.registerWithInvite(data);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// POST /api/auth/login - Login
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    res.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// GET /api/auth/me - Aktueller User
authRouter.get('/me', verifyToken, async (req: AuthRequest, res, next) => {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
