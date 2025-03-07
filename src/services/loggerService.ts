import winston from 'winston';
import { Request, Response } from 'express';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error' 
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log' 
        })
    ]
});

export const requestLogger = (req: Request, res: Response, next: Function) => {
    const start = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: Function) => {
    logger.error('Error occurred', {
        error: {
            message: err.message,
            stack: err.stack
        },
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        body: req.body,
        ip: req.ip
    });
    next(err);
};

export default logger; 