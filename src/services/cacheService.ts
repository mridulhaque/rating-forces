import NodeCache from 'node-cache';

class CacheService {
    private static instance: CacheService;
    private cache: NodeCache;
    private readonly DEFAULT_TTL = 300; // 5 minutes in seconds

    private constructor() {
        this.cache = new NodeCache({
            stdTTL: this.DEFAULT_TTL,
            checkperiod: 120 // Check for expired keys every 2 minutes
        });
    }

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    public get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    public set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): boolean {
        return this.cache.set(key, value, ttl);
    }

    public del(key: string): number {
        return this.cache.del(key);
    }

    public flush(): void {
        this.cache.flushAll();
    }

    public generateKey(...args: any[]): string {
        return args.map(arg => JSON.stringify(arg)).join(':');
    }
}

export default CacheService.getInstance(); 