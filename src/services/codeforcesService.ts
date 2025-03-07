import { BaseApiService } from './baseApiService';
import { PerformanceCalculator } from '../utils/performanceCalculator';
import {
    CodeforcesUserInfo,
    CodeforcesContestInfo,
    ContestStandingsResponse,
    ContestRatingChange,
    PerformanceResult
} from '../types/codeforces';

class CodeforcesService extends BaseApiService {
    constructor() {
        super('https://codeforces.com/api');
    }

    async getUserInfo(handle: string): Promise<CodeforcesUserInfo> {
        try {
            const response = await this.api.get('/user.info', {
                params: { handles: handle }
            });
            
            if (response.data.status === 'OK') {
                return response.data.result[0];
            }
            throw new Error('Failed to fetch user info');
        } catch (error) {
            throw this.handleError(error, 'Error fetching user info');
        }
    }

    async getContestInfo(contestId: number): Promise<CodeforcesContestInfo> {
        try {
            const response = await this.api.get('/contest.standings', {
                params: {
                    contestId,
                    from: 1,
                    count: 1
                }
            });
            
            if (response.data.status === 'OK') {
                return response.data.result.contest;
            }
            throw new Error('Failed to fetch contest info');
        } catch (error) {
            throw this.handleError(error, 'Error fetching contest info');
        }
    }

    async getContestStandings(contestId: number): Promise<ContestStandingsResponse> {
        try {
            const response = await this.api.get('/contest.standings', {
                params: {
                    contestId,
                    showUnofficial: false
                }
            });
            
            if (response.data.status === 'OK') {
                return response.data.result;
            }
            throw new Error('Failed to fetch contest standings');
        } catch (error) {
            throw this.handleError(error, 'Error fetching contest standings');
        }
    }

    private async getContestantRatings(standings: ContestStandingsResponse, contestId: number): Promise<number[]> {
        try {
            // Try to get ratings from contest rating changes
            const response = await this.api.get('/contest.ratingChanges', {
                params: { contestId }
            });
            
            if (response.data.status === 'OK') {
                const ratingMap = new Map<string, number>(
                    response.data.result.map((change: ContestRatingChange) => 
                        [change.handle, change.oldRating]
                    )
                );
                
                return standings.rows.map(row => 
                    ratingMap.get(row.party.members[0].handle) ?? 1500
                );
            }
        } catch (error) {
            // Fallback to user.info
            const handles = standings.rows.map(row => row.party.members[0].handle);
            return await this.getRatingsFromUserInfo(handles);
        }
        
        return standings.rows.map(() => 1500); // Default fallback
    }

    private async getRatingsFromUserInfo(handles: string[]): Promise<number[]> {
        const chunkSize = 5000; // Codeforces API limit
        const ratings: number[] = [];
        
        for (let i = 0; i < handles.length; i += chunkSize) {
            const chunk = handles.slice(i, i + chunkSize);
            const response = await this.api.get('/user.info', {
                params: { handles: chunk.join(';') }
            });
            
            if (response.data.status === 'OK') {
                ratings.push(...response.data.result.map((user: CodeforcesUserInfo) => 
                    user.rating || 1500
                ));
            }
            await this.sleep();
        }
        
        return ratings;
    }

    async calculatePerformance(contestId: number, userHandle: string): Promise<number> {
        try {
            const standings = await this.getContestStandings(contestId);
            await this.sleep();
            
            const userIndex = standings.rows.findIndex(
                row => row.party.members.some(member => member.handle === userHandle)
            );

            if (userIndex === -1) {
                throw new Error('User not found in contest');
            }

            const userRank = standings.rows[userIndex].rank;
            const ratings = await this.getContestantRatings(standings, contestId);
            
            return PerformanceCalculator.calculateRating(userRank, ratings);
        } catch (error) {
            throw this.handleError(error, 'Error calculating performance');
        }
    }

    async calculateMultiplePerformances(contestId: number, handles: string[]): Promise<PerformanceResult[]> {
        try {
            const standings = await this.getContestStandings(contestId);
            await this.sleep();

            const ratings = await this.getContestantRatings(standings, contestId);
            ratings.sort((a, b) => b - a);

            return handles.map(handle => {
                const userIndex = standings.rows.findIndex(
                    row => row.party.members.some(member => member.handle === handle)
                );

                if (userIndex === -1) {
                    return { handle, performance: null };
                }

                const userRank = standings.rows[userIndex].rank;
                const performance = PerformanceCalculator.calculateRating(userRank, ratings);
                return { handle, performance };
            });
        } catch (error) {
            throw this.handleError(error, 'Error calculating multiple performances');
        }
    }
}

export default new CodeforcesService(); 