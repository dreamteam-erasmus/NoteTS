import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { Announcement, CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { appendAnnouncement, deleteAnnouncement, getAnnouncements } from '../dataManager/announcementsDB.js';

const router = Router();

// ===================
// GET /api/announcements
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch announcements from database
    res.json({
        data: getAnnouncements(),
        message: 'Get all announcements',
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
// POST /api/announcements
// ===================
router.post('/', (req: Request, res: Response) => {
    const announcementData: Announcement = req.body;
    console.log(announcementData)
    appendAnnouncement(new Announcement(announcementData.title, announcementData.content, announcementData.type))
    res.status(201).json({
        data: announcementData,
        message: 'Announcement created',
    });
});

// ===================
// DELETE /api/announcements
// ===================
router.delete('/', (req: Request, res: Response) => {
    const announcementData: any = req.body;
    console.log(announcementData)
    deleteAnnouncement(announcementData.id)
    res.status(201).json({
        data: announcementData,
        message: 'Announcement deleted',
    });
});

export default router;
