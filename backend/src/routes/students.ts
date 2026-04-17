import { Router } from 'express';
import { verifyToken, requireRole, AuthRequest } from '../middleware/auth';
import * as studentService from '../services/student.service';

export const studentsRouter = Router();

studentsRouter.use(verifyToken);
studentsRouter.use(requireRole('INSTRUCTOR'));

// GET /api/students - Meine zugeordneten Schüler
studentsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const students = await studentService.getStudents(req.user!.userId);
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/students/:id - Schüler-Zuordnung entfernen
studentsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await studentService.removeStudent(req.user!.userId, String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
