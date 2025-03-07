import axios, { AxiosInstance } from 'axios';

export abstract class BaseApiService {
    protected readonly api: AxiosInstance;
    protected readonly sleepTime: number;

    constructor(baseURL: string, sleepTime: number = 500) {
        this.api = axios.create({
            baseURL,
            timeout: 10000
        });
        this.sleepTime = sleepTime;
    }

    protected async sleep(ms: number = this.sleepTime): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    protected handleError(error: unknown, message: string): never {
        if (error instanceof Error) {
            throw new Error(`${message}: ${error.message}`);
        }
        throw new Error(`${message}: Unknown error occurred`);
    }
} 