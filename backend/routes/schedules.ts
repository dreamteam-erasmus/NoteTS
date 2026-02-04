import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Schedule, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendSchedule, getSchedules } from '../dataManager/schedulesDB.js';

const router = Router();

// ===================
// GET /api/schedules
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch schedules from database
    res.json({
        data: getSchedules(),
        message: 'Get all schedules',
    });
});

// ===================
// GET /api/users/:id
// ===================
//router.get('/:id', (req: Request, res: Response) => {
//    const { id } = req.params;
//    // TODO: Fetch user by ID from database
//    res.json({
//        data: { id },
//        message: `Get user ${id}`,
//    });
//});

// ===================
// POST /api/schedules
// ===================
// ===================
// POST /api/schedules
// ===================
router.post('/', (req: Request, res: Response) => {
    const { periods } = req.body;
    if (!periods) return res.status(400).json({ error: 'Missing periods data' });

    // For now, we manage a single global schedule. 
    // We clear existing ones and add the new one.
    const newSchedule = new Schedule(periods);

    // Accessing internal array and saving
    const schedules = getSchedules();
    schedules.length = 0; // Clear array
    appendSchedule(newSchedule);

    res.status(201).json({
        data: newSchedule,
        message: 'Schedule saved successfully',
    });
});

export default router;
