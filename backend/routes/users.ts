import { Router, Request, Response } from 'express';
import { appendUser, getUserByName, getUsers } from '../dataManager/userDB.js';
import { CreateUserDto, User } from "../types/index.js";
import { hash, randomBytes } from "crypto";
import { getAnnouncements } from '../dataManager/announcementsDB.js';

export const tokens: Map<string, string> = new Map()
const router = Router();

// ===================
// GET /api/users
// ===================
router.get('/', (_req: Request, res: Response) => {
    res.json({
        data: getUsers(),
        message: 'Get all users',
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
// POST /api/users
// ===================
router.post('/', (req: Request, res: Response) => {
    const userData: User = req.body;
    console.log(userData)
    appendUser(new User(userData.email, userData.name, userData.password,userData.isAdmin))
    res.status(201).json({
        data: userData,
        message: 'User created',
    });
});

// ===================
// POST /api/users/login
// ===================
router.post('/login', (req: Request, res: Response) => {
    console.log("Checking login");
    
    const userData: User = req.body;
    console.log(userData);
    const user = getUserByName(userData.name)
    console.log(user);
    if (user == null) {
        console.log("Invalid username");
        //Invalid login
        res.status(201).json({
            data: false,
            message: 'Invalid login',
        });
        return
    }
    if (user.password != hash("sha256", userData.password)) {
        console.log("Invalid password");
        //Invalid login
        res.status(201).json({
            data: false,
            message: 'Invalid login',
        });
        return
    }

    //Login OK
    var cookieValue = randomBytes(26).toString('hex')
    tokens.set(cookieValue,user.id)
    console.log("Setting cookies");
    
    res.cookie("login", cookieValue)
    res.cookie("userId", user.id)
    res.status(201).json({
        data: true,
        message: 'Login success',
    });
});

//// ===================
//// PUT /api/users/:id
//// ===================
//router.put('/:id', (req: Request, res: Response) => {
//    const { id } = req.params;
//    const userData = req.body;
//    // TODO: Update user in database
//    res.json({
//        data: { id, ...userData },
//        message: `User ${id} updated`,
//    });
//});
//
//// ===================
//// DELETE /api/users/:id
//// ===================
//router.delete('/:id', (req: Request, res: Response) => {
//    const { id } = req.params;
//    // TODO: Delete user from database
//    res.json({
//        message: `User ${id} deleted`,
//    });
//});

export default router;
