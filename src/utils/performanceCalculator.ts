export class PerformanceCalculator {
    private static readonly MIN_RATING = 1;
    private static readonly MAX_RATING = 5000;
    private static readonly ELO_FACTOR = 400;
    private static readonly ITERATIONS = 30;

    /**
     * Calculates performance rating based on rank and competitor ratings
     * @param rank - 1-based rank in the contest
     * @param ratings - Array of competitor ratings
     * @returns Calculated performance rating
     */
    public static calculateRating(rank: number, ratings: number[]): number {
        // Calculate seed - probability of performing better than given rank
        // sort ratings in descending order
        const sortedRatings = ratings.sort((a, b) => b - a);
        
        const seed = (rank - 1) / sortedRatings.length;
        
        // Binary search to find rating that would give this seed
        let left = this.MIN_RATING;
        let right = this.MAX_RATING;
        
        for (let iter = 0; iter < this.ITERATIONS; iter++) {
            const mid = Math.floor((left + right) / 2);
            const currSeed = this.calculateSeed(mid, ratings);
            
            if (currSeed < seed) {
                right = mid;
            } else {
                left = mid;
            }
        }
        
        return Math.round((left + right) / 2);
    }

    /**
     * Calculates the seed (average win probability) for a given rating
     * @param rating - Rating to calculate seed for
     * @param competitorRatings - Array of competitor ratings
     * @returns Calculated seed value
     */
    private static calculateSeed(rating: number, competitorRatings: number[]): number {
        let totalProbability = 0;
        
        for (const competitorRating of competitorRatings) {
            totalProbability += this.calculateWinProbability(rating, competitorRating);
        }
        
        return totalProbability / competitorRatings.length;
    }

    /**
     * Calculates win probability using Elo rating formula
     * @param ratingA - First player's rating
     * @param ratingB - Second player's rating
     * @returns Probability of first player winning
     */
    private static calculateWinProbability(ratingA: number, ratingB: number): number {
        return 1.0 / (1.0 + Math.pow(10, (ratingA - ratingB) / this.ELO_FACTOR));
    }
} 