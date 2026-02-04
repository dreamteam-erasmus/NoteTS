import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Schedule, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendSchedule, deleteSchedule, getSchedules } from '../dataManager/schedulesDB.js';

const router = Router();

// ===================
// GET /api/schedules
// ===================
router.get('/', (req: Request, res: Response) => {
    const { classId } = req.query;
    let schedules = getSchedules();

    if (classId) {
        schedules = schedules.filter(s => s.classId === classId);
    }

    res.json({
        data: schedules,
        message: 'Get schedules',
    });
});

// ===================
// POST /api/schedules
// ===================
router.post('/', (req: Request, res: Response) => {
    const { periods, classId } = req.body;
    if (!periods) return res.status(400).json({ error: 'Missing periods data' });

    // We clear existing schedule for this specific class if it exists
    const schedules = getSchedules();
    const existingIdx = schedules.findIndex(s => s.classId === (classId || ""));

    if (existingIdx !== -1) {
        schedules.splice(existingIdx, 1);
    }

    const newSchedule = new Schedule(periods, classId || "");
    appendSchedule(newSchedule);

    res.status(201).json({
        data: newSchedule,
        message: `Schedule saved for class ${classId || 'Global'}`,
    });
});

// ===================
// DELETE /api/schedules
// ===================
router.delete('/', (req: Request, res: Response) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Missing ID' });
    deleteSchedule(id);
    res.json({ message: 'Schedule deleted' });
});

export default router;
