import { Router, Request, Response } from 'express';
import type { RequestHandler } from 'express';
import codeforcesService from '../services/codeforcesService';
import cacheService from '../services/cacheService';

const router = Router();

/**
 * @swagger
 * /api/codeforces/user/{handle}:
 *   get:
 *     summary: Get user information from Codeforces
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: Codeforces handle of the user
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user/:handle', (async (req: Request, res: Response) => {
    try {
        const { handle } = req.params;
        const cacheKey = cacheService.generateKey('user', handle);
        
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const userInfo = await codeforcesService.getUserInfo(handle);
        cacheService.set(cacheKey, userInfo);
        res.json(userInfo);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

/**
 * @swagger
 * /api/codeforces/contest/{contestId}:
 *   get:
 *     summary: Get contest information
 *     tags: [Contests]
 *     parameters:
 *       - in: path
 *         name: contestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the Codeforces contest
 *     responses:
 *       200:
 *         description: Contest information retrieved successfully
 *       400:
 *         description: Invalid contest ID
 *       500:
 *         description: Server error
 */
router.get('/contest/:contestId', (async (req: Request, res: Response) => {
    try {
        const contestId = parseInt(req.params.contestId);
        if (isNaN(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }

        const cacheKey = cacheService.generateKey('contest', contestId);
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const contestInfo = await codeforcesService.getContestInfo(contestId);
        cacheService.set(cacheKey, contestInfo);
        res.json(contestInfo);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

/**
 * @swagger
 * /api/codeforces/contest/{contestId}/performance/{handle}:
 *   get:
 *     summary: Calculate performance rating for a user in a contest
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: contestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the Codeforces contest
 *       - in: path
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: Codeforces handle of the user
 *     responses:
 *       200:
 *         description: Performance rating calculated successfully
 *       400:
 *         description: Invalid contest ID
 *       404:
 *         description: User not found in contest
 *       500:
 *         description: Server error
 */
router.get('/contest/:contestId/performance/:handle', (async (req: Request, res: Response) => {
    try {
        const contestId = parseInt(req.params.contestId);
        const { handle } = req.params;
        
        if (isNaN(contestId)) {
            return res.status(400).json({ error: 'Invalid contest ID' });
        }

        const cacheKey = cacheService.generateKey('performance', contestId, handle);
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        
        const performance = await codeforcesService.calculatePerformance(contestId, handle);
        const result = { performance };
        cacheService.set(cacheKey, result);
        res.json(result);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

/**
 * @swagger
 * /api/codeforces/contest/{contestId}/performances:
 *   post:
 *     summary: Calculate performance ratings for multiple users in a contest
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: contestId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the Codeforces contest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of Codeforces handles
 *     responses:
 *       200:
 *         description: Performance ratings calculated successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
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

        const cacheKey = cacheService.generateKey('performances', contestId, handles);
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }
        
        const performances = await codeforcesService.calculateMultiplePerformances(contestId, handles);
        const result = { performances };
        cacheService.set(cacheKey, result);
        res.json(result);
    } catch (error: unknown) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
}) as RequestHandler);

export default router; 