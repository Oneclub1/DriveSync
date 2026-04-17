import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import * as notificationService from '../services/notification.service';
import { getVapidPublicKey } from '../services/push.service';

export const notificationsRouter = Router();

// GET /api/notifications/vapid-public-key - Public (für Push-Setup)
notificationsRouter.get('/vapid-public-key', (_req, res) => {
  res.json({ key: getVapidPublicKey() });
});

notificationsRouter.use(verifyToken);

// GET /api/notifications - Eigene Benachrichtigungen
notificationsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const notifications = await notificationService.getMyNotifications(req.user!.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/:id/read - Als gelesen markieren
notificationsRouter.post('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markAsRead(req.user!.userId, String(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/read-all - Alle als gelesen markieren
notificationsRouter.post('/read-all', async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
