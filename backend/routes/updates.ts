import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Update, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendUpdate, deleteUpdate, getUpdates } from '../dataManager/updatesDB.js';

const router = Router();

// ===================
// GET /api/updates
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch updates from database
    res.json({
        data: getUpdates(),
        message: 'Get all updates',
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
// POST /api/updates
// ===================
router.post('/', (req: Request, res: Response) => {
    const updateData: Update = req.body;
    console.log(updateData)
    appendUpdate(new Update(updateData.message))
    res.status(201).json({
        data: updateData,
        message: 'Update created',
    });
});

// ===================
// DELETE /api/updates
// ===================
router.delete('/', (req: Request, res: Response) => {
    const updateData: any = req.body;
    console.log(updateData)
    deleteUpdate(updateData.id)
    res.status(201).json({
        data: updateData,
        message: 'Update deleted',
    });
});


export default router;
