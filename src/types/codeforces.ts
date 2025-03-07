export interface CodeforcesUserInfo {
    handle: string;
    rating?: number;
    rank?: string;
    maxRating?: number;
    [key: string]: any; // for other properties that might be returned
}

export interface CodeforcesContestInfo {
    id: number;
    name: string;
    type: string;
    phase: string;
    [key: string]: any; // for other properties that might be returned
}

export interface ContestStanding {
    rank: number;
    party: {
        members: Array<{
            handle: string;
        }>;
    };
    points: number;
}

export interface ContestRatingChange {
    contestId: number;
    contestName: string;
    handle: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
}

export interface ContestStandingsResponse {
    contest: CodeforcesContestInfo;
    problems: any[];
    rows: ContestStanding[];
}

export interface PerformanceResult {
    handle: string;
    performance: number | null;
} 