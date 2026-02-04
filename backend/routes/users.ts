import { Router, Request, Response } from 'express';

const router = Router();

// ===================
// GET /api/users
// ===================
router.get('/', (_req: Request, res: Response) => {
    // TODO: Fetch users from database
    res.json({
        data: [],
        message: 'Get all users',
    });
});

// ===================
// GET /api/users/:id
// ===================
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Fetch user by ID from database
    res.json({
        data: { id },
        message: `Get user ${id}`,
    });
});

// ===================
// POST /api/users
// ===================
router.post('/', (req: Request, res: Response) => {
    const userData = req.body;
    // TODO: Create user in database
    res.status(201).json({
        data: userData,
        message: 'User created',
    });
});

// ===================
// PUT /api/users/:id
// ===================
router.put('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const userData = req.body;
    // TODO: Update user in database
    res.json({
        data: { id, ...userData },
        message: `User ${id} updated`,
    });
});

// ===================
// DELETE /api/users/:id
// ===================
router.delete('/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // TODO: Delete user from database
    res.json({
        message: `User ${id} deleted`,
    });
});

export default router;
