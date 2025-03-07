import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'OnlineJudge Performance API',
            version: '1.0.0',
            description: 'API for calculating OnlineJudge\'s contest performance ratings',
            contact: {
                name: 'API Support',
                url: 'https://github.com/mridulhaque/rating-forces'
            }
        },
        servers: [
            {
                url: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`,
                description: 'Development server'
            }
        ]
    },
    apis: ['./src/routes/*.ts'] // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 