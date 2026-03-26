import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as invitationService from '../services/invitation.service';

export const invitationsRouter = Router();

const createInvitationSchema = z.object({
  email: z.string().email('Ungültige E-Mail'),
});

// GET /api/invitations/validate/:token - Token prüfen (öffentlich)
invitationsRouter.get('/validate/:token', async (req, res, next) => {
  try {
    const result = await invitationService.validateToken(req.params.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Ab hier: Auth + Instructor-Rolle nötig
invitationsRouter.use(verifyToken);
invitationsRouter.use(requireRole('INSTRUCTOR'));

// POST /api/invitations - Einladung erstellen
invitationsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createInvitationSchema.parse(req.body);
    const invitation = await invitationService.createInvitation(req.user!.userId, data.email);
    res.status(201).json(invitation);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// GET /api/invitations - Eigene Einladungen
invitationsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const invitations = await invitationService.getMyInvitations(req.user!.userId);
    res.json(invitations);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/invitations/:id - Einladung widerrufen
invitationsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await invitationService.revokeInvitation(req.user!.userId, String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
