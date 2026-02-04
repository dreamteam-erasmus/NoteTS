import { Request, Response, NextFunction } from 'express';
import { tokens } from '../routes/users.js';
import { getUserById } from '../dataManager/userDB.js';

export function authCheck(req: Request, res: Response): boolean {
    if (req.cookies == null || req.cookies == undefined) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
             return false
    }

    const userId = req.cookies.userId;
    const token = req.cookies.login;
    console.log(token);
    console.log(userId);
    
    if (!token || !userId) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return false
    }
    // Verify cookie
    if (tokens.get(token) != userId) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return false
    }
    return true
}

export function authCheckAdmin(req: Request, res: Response): boolean {
    if (authCheck(req, res)) {
        const userId = req.cookies.userId;
        console.log(userId);
        
        if (userId == null) {
             res.status(401).json({ message: 'Access denied. No token provided.' });
             return false
        }
        const user = getUserById(userId)
        if (user?.isAdmin) {
            return true
        } else {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return false
        }
    }
    return false
}

/**
 * Authentication middleware placeholder
 * TODO: Implement actual authentication logic (JWT, session, etc.)
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    if (authCheck(req, res)) {
        next()
    }
};

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
    
};
