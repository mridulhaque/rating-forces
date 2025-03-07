import { Router, Request, Response } from 'express';
import type { RequestHandler } from 'express';
import codeforcesService from '../services/codeforcesService';

const router = Router();

router.get('/user/:handle', (async (req: Request, res: Response) => {
    try {
        const { handle } = req.params;
        const userInfo = await codeforcesService.getUserInfo(handle);
        res.json(userInfo);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

router.get('/contest/:contestId', (async (req: Request, res: Response) => {
    try {
        const contestId = parseInt(req.params.contestId);
        if (isNaN(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }
        const contestInfo = await codeforcesService.getContestInfo(contestId);
        res.json(contestInfo);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

router.get('/contest/:contestId/performance/:handle', (async (req: Request, res: Response) => {
    try {
        const contestId = parseInt(req.params.contestId);
        const { handle } = req.params;
        
        if (isNaN(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }
        
        const performance = await codeforcesService.calculatePerformance(contestId, handle);
        res.json({ performance });
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

router.post('/contest/:contestId/performances', (async (req: Request, res: Response) => {
    try {
        const contestId = parseInt(req.params.contestId);
        const { handles } = req.body;
        
        if (isNaN(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }
        
        if (!Array.isArray(handles) || handles.length === 0) {
            return res.status(400).json({ error: 'Handles must be a non-empty array' });
        }

        if (handles.some(handle => typeof handle !== 'string')) {
            return res.status(400).json({ error: 'All handles must be strings' });
        }
        
        const performances = await codeforcesService.calculateMultiplePerformances(contestId, handles);
        res.json({ performances });
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

export default router; 