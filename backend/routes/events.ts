import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Event, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendEvent, deleteEvent, getEvents } from '../dataManager/eventsDB.js';

const router = Router();

// ===================
// GET /api/events
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch events from database
    res.json({
        data: getEvents(),
        message: 'Get all events',
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
// POST /api/events
// ===================
router.post('/', (req: Request, res: Response) => {
    const eventData: Event = req.body;
    console.log(eventData)
    appendEvent(new Event(eventData.title, eventData.type,eventData.time, eventData.location))
    res.status(201).json({
        data: eventData,
        message: 'Event created',
    });
});

// ===================
// DELETE /api/events
// ===================
router.delete('/', (req: Request, res: Response) => {
    const eventData: any = req.body;
    console.log(eventData)
    deleteEvent(eventData.id)
    res.status(201).json({
        data: eventData,
        message: 'Event deleted',
    });
});

export default router;
