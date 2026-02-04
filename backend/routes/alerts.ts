import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Alert, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendAlert, deleteAlert, getAlerts } from '../dataManager/alertsDB.js';

const router = Router();

// ===================
// GET /api/alerts
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch alerts from database
    res.json({
        data: getAlerts(),
        message: 'Get all alerts',
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
// POST /api/alerts
// ===================
router.post('/', (req: Request, res: Response) => {
    const alertData: Alert = req.body;
    console.log(alertData)
    appendAlert(new Alert(alertData.message))
    res.status(201).json({
        data: alertData,
        message: 'Alert created',
    });
});

// ===================
// DELETE /api/alerts
// ===================
router.delete('/', (req: Request, res: Response) => {
    const alertData: any = req.body;
    console.log(alertData)
    deleteAlert(alertData.id)
    res.status(201).json({
        data: alertData,
        message: 'Alert deleted',
    });
});


export default router;
