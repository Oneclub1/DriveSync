import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import * as statsService from '../services/stats.service';

export const statsRouter = Router();

statsRouter.use(verifyToken);

statsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const stats =
      req.user!.role === 'INSTRUCTOR'
        ? await statsService.getInstructorStats(req.user!.userId)
        : await statsService.getLearnerStats(req.user!.userId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});
