import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { generateICSFeed } from '../services/calendar.service';

export const calendarRouter = Router();

/**
 * GET /api/calendar/ics?token=JWT
 * Token via Query-Param damit Kalender-Apps (Apple/Google) den Feed abonnieren können.
 */
calendarRouter.get('/ics', async (req, res, next) => {
  try {
    const token = req.query.token as string;
    if (!token) return res.status(401).send('Token erforderlich');

    let payload: any;
    try {
      payload = jwt.verify(token, config.jwt.secret);
    } catch {
      return res.status(401).send('Ungültiger Token');
    }

    const ics = await generateICSFeed(payload.userId, payload.role);
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="drivesync.ics"');
    res.send(ics);
  } catch (err) {
    next(err);
  }
});
