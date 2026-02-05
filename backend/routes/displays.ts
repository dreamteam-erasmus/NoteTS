import { Router, Request, Response } from 'express';
import { Display } from "../types/index.js";
import {
    getDisplays,
    getDisplay,
    registerDisplay,
    pingDisplay,
    updateDisplay,
    deleteDisplay,
    queueCommand,
    getAndClearCommands
} from '../dataManager/displaysDB.js';

const router = Router();

// ===================
// GET /api/displays
// ===================
router.get('/', (_req: Request, res: Response) => {
    res.json({
        data: getDisplays(),
        message: 'Get all displays',
    });
});

// ===================
// GET /api/displays/:id
// ===================
router.get('/:id', (req: Request, res: Response) => {
    const id = req.params.id as string;
    const display = getDisplay(id);
    if (!display) {
        res.status(404).json({
            message: 'Display not found',
            error: 'NOT_FOUND'
        });
        return;
    }
    res.json({
        data: display,
        message: 'Get display',
    });
});

// ===================
// POST /api/displays/register
// ===================
router.post('/register', (req: Request, res: Response) => {
    const { name, userAgent } = req.body;
    const display = registerDisplay(name || 'Unnamed Display', userAgent);
    res.status(201).json({
        data: display,
        message: 'Display registered',
    });
});

// ===================
// POST /api/displays/:id/ping
// ===================
router.post('/:id/ping', (req: Request, res: Response) => {
    const id = req.params.id as string;
    const display = pingDisplay(id);
    if (!display) {
        res.status(404).json({
            message: 'Display not found',
            error: 'NOT_FOUND'
        });
        return;
    }
    // Return any pending commands
    const commands = getAndClearCommands(id);
    res.json({
        data: display,
        commands,
        message: 'Display ping received',
    });
});

// ===================
// POST /api/displays/:id/command
// ===================
router.post('/:id/command', (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { command, data } = req.body;
    const display = getDisplay(id);
    if (!display) {
        res.status(404).json({
            message: 'Display not found',
            error: 'NOT_FOUND'
        });
        return;
    }
    queueCommand(id, command, data);
    res.json({
        message: `Command '${command}' queued for display`,
    });
});

// ===================
// PATCH /api/displays/:id
// ===================
router.patch('/:id', (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, group, settings } = req.body;
    const display = updateDisplay(id, { name, group, settings });
    if (!display) {
        res.status(404).json({
            message: 'Display not found',
            error: 'NOT_FOUND'
        });
        return;
    }
    res.json({
        data: display,
        message: 'Display updated',
    });
});

// ===================
// DELETE /api/displays
// ===================
router.delete('/', (req: Request, res: Response) => {
    const { id } = req.body;
    deleteDisplay(id);
    res.json({
        data: { id },
        message: 'Display deleted',
    });
});

export default router;
