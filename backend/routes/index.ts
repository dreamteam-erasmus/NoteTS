import { Router } from 'express';

// Import route modules
import usersRouter from './users.js';

const router = Router();

// Mount route modules
router.use('/users', usersRouter);

// API root endpoint
router.get('/', (_req, res) => {
    res.json({
        message: 'NoteTS API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
        },
    });
});

export default router;
