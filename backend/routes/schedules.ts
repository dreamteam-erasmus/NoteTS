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
// router.post('/', (req: Request, res: Response) => {
//     const scheduleData: Schedule = req.body;
//     console.log(scheduleData)
//     appendSchedule(new Schedule(scheduleData.title, scheduleData.type,scheduleData.time, scheduleData.location))
//     res.status(201).json({
//         data: scheduleData,
//         message: 'Schedule created',
//     });
// });

export default router;
