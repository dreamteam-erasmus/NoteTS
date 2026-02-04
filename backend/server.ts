import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import routes
import apiRouter from './routes/index.js';
import { loadUserDB } from './dataManager/userDB.js';
import { loadAnnouncementsDB } from './dataManager/announcementsDB.js';
import { loadEventsDB } from './dataManager/eventsDB.js';
import { loadAlertDB as loadAlertsDB } from './dataManager/alertsDB.js';
import { loadUpdateDB as loadUpdatesDB } from './dataManager/updatesDB.js';
import { loadScheduleDB } from './dataManager/schedulesDB.js';
import { authCheck, authCheckAdmin, authenticate, authenticateAdmin } from './middleware/auth.js';

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// ===================
// Middleware
// ===================

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ===================
// Routes
// ===================

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/login', (_req: Request, res: Response) => {
    res.sendFile("login.html", { root: "./src" })
});

//Get restricted
app.get('/dash', (_req: Request, res: Response) => {
    if (authCheck(_req, res)) {
        res.sendFile("dash.html", { root: "./src" })
    }
});
app.get('/admin', (_req: Request, res: Response) => {
    if (authCheckAdmin(_req,res)) {
    res.sendFile("admin.html", { root: "./src" })
    }
});


// API routes
app.use('/api', apiRouter);

// ===================
// Error Handling
// ===================

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});


//Load DB
await loadUserDB()
await loadAnnouncementsDB()
await loadEventsDB()
await loadAlertsDB()
await loadUpdatesDB()
await loadScheduleDB()

// ===================
// Start Server
// ===================

app.use(cookieParser())

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
