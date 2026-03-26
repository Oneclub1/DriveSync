import { Router } from 'express';
import { z } from 'zod';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as bookingService from '../services/booking.service';

export const bookingsRouter = Router();

// Alle Booking-Routen brauchen Auth
bookingsRouter.use(verifyToken);

const createBookingSchema = z.object({
  timeSlotId: z.string().uuid(),
  notes: z.string().optional(),
});

// POST /api/bookings - Slot buchen (Learner)
bookingsRouter.post('/', requireRole('LEARNER'), async (req: AuthRequest, res, next) => {
  try {
    const data = createBookingSchema.parse(req.body);
    const booking = await bookingService.bookSlot(req.user!.userId, data.timeSlotId, data.notes);
    res.status(201).json(booking);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
});

// GET /api/bookings/mine - Eigene Buchungen (Learner)
bookingsRouter.get('/mine', requireRole('LEARNER'), async (req: AuthRequest, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user!.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id - Stornieren (Learner)
bookingsRouter.delete('/:id', requireRole('LEARNER'), async (req: AuthRequest, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.user!.userId, String(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/instructor - Buchungen meiner Schüler (Instructor)
bookingsRouter.get('/instructor', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    const bookings = await bookingService.getInstructorBookings(req.user!.userId);
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/bookings/:id/confirm - Buchung bestätigen (Instructor)
bookingsRouter.patch('/:id/confirm', requireRole('INSTRUCTOR'), async (req: AuthRequest, res, next) => {
  try {
    const booking = await bookingService.confirmBooking(req.user!.userId, String(req.params.id));
    res.json(booking);
  } catch (err) {
    next(err);
  }
});
