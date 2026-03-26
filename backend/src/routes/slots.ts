import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as slotService from '../services/slot.service';

export const slotsRouter = Router();

// Alle Slot-Routen brauchen Auth
slotsRouter.use(verifyToken);

const createSlotSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  slotType: z.enum(['LESSON', 'BLOCKED', 'BREAK']).optional(),
  repeatWeeks: z.number().min(1).max(12).optional(),
});

// GET /api/slots/available - Verfügbare Slots für Learner
slotsRouter.get('/available', requireRole('LEARNER'), async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const slots = await slotService.getAvailableSlots(
      req.user!.userId,
      from as string | undefined,
      to as string | undefined,
    );
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

// GET /api/slots/my - Eigene Slots (Instructor)
slotsRouter.get('/my', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    const { from, to } = req.query;
    const slots = await slotService.getMySlots(
      req.user!.userId,
      from as string | undefined,
      to as string | undefined,
    );
    res.json(slots);
  } catch (err) {
    next(err);
  }
});

// POST /api/slots - Slot erstellen (Instructor)
slotsRouter.post('/', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    const data = createSlotSchema.parse(req.body);

    if (data.repeatWeeks && data.repeatWeeks > 1) {
      const slots = await slotService.createBulkSlots(req.user!.userId, data);
      return res.status(201).json(slots);
    }

    const slot = await slotService.createSlot(req.user!.userId, data);
    res.status(201).json(slot);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// DELETE /api/slots/:id - Slot löschen (Instructor)
slotsRouter.delete('/:id', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    await slotService.deleteSlot(req.user!.userId, String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
