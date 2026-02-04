import { Router } from 'express';

// Import route modules
import usersRouter from './users.js';
import announcementsRouter from './announcements.js';
import eventRouter from './events.js';
import updateRouter from './updates.js';
import alertRouter from './alerts.js';
import scheduleRouter from './schedules.js';

const router = Router();

// Mount route modules
router.use('/users', usersRouter);
router.use('/announcements', announcementsRouter);
router.use('/events', eventRouter);
router.use('/alerts', alertRouter);
router.use('/updates', updateRouter);
router.use('/schedules', scheduleRouter);

// API root endpoint
router.get('/', (_req, res) => {
    res.json({
        message: 'NoteTS API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            announcements: '/api/announcements',
            events: '/api/events',
            alerts: '/api/alers',
            updates: '/api/updates',
            schedule: '/api/schedules',
        },
    });
});

export default router;
