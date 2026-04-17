import { Router } from 'express';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as paymentService from '../services/payment.service';

export const paymentsRouter = Router();

paymentsRouter.use(verifyToken);
paymentsRouter.use(requireRole('LEARNER'));

// POST /api/payments/intent - Payment Intent für Buchung erstellen
paymentsRouter.post('/intent', async (req: AuthRequest, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId erforderlich' });

    const result = await paymentService.createPaymentIntent(bookingId, req.user!.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/payments/status/:bookingId - Zahlungsstatus
paymentsRouter.get('/status/:bookingId', async (req: AuthRequest, res, next) => {
  try {
    const status = await paymentService.getPaymentStatus(
      String(req.params.bookingId),
      req.user!.userId,
    );
    res.json(status);
  } catch (err) {
    next(err);
  }
});
