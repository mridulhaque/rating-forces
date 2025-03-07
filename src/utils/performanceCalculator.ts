export class PerformanceCalculator {
    private static readonly MIN_RATING = 1;
    private static readonly MAX_RATING = 5000;
    private static readonly ELO_FACTOR = 400;
    private static readonly ITERATIONS = 30;

    /**
     * Calculates performance rating based on rank and competitor ratings.
     * 
     * The method finds the rating R such that the sum of win probabilities
     * against all competitors equals (rank - 0.5), which is similar to how
     * Codeforces calculates performance rating.
     *
     * @param rank - 1-based rank in the contest
     * @param ratings - Array of competitor ratings
     * @returns Calculated performance rating
     */
    public static calculateRating(rank: number, ratings: number[]): number {
        // Target: sum of win probabilities should equal (rank - 0.5)
        const targetSum = rank - 0.5;

        let left = this.MIN_RATING;
        let right = this.MAX_RATING;

        // Binary search for the rating R that gives the desired target sum.
        // Note: As R increases, win probabilities decrease, so the sum is monotonically decreasing.
        for (let iter = 0; iter < this.ITERATIONS; iter++) {
            const mid = (left + right) / 2;
            const currSum = this.calculateSeed(mid, ratings);
            
            if (currSum > targetSum) {
                // If the current sum is too high, then our candidate rating is too low.
                // Increase it by moving the lower bound up.
                left = mid;
            } else {
                // Otherwise, our candidate rating is too high, so move the upper bound down.
                right = mid;
            }
        }
        
        return Math.round((left + right) / 2);
    }

    /**
     * Calculates the total win probability for a given rating against all competitor ratings.
     *
     * @param rating - The candidate performance rating to evaluate.
     * @param competitorRatings - Array of competitor ratings.
     * @returns The total win probability (the “seed”) for that rating.
     */
    private static calculateSeed(rating: number, competitorRatings: number[]): number {
        let totalProbability = 0;
        
        for (const competitorRating of competitorRatings) {
            totalProbability += this.calculateWinProbability(rating, competitorRating);
        }
        
        return totalProbability;
    }

    /**
     * Calculates the win probability using the Elo formula.
     *
     * @param ratingA - Candidate performance rating.
     * @param ratingB - Competitor rating.
     * @returns Probability of the candidate outperforming the competitor.
     */
    private static calculateWinProbability(ratingA: number, ratingB: number): number {
        return 1.0 / (1.0 + Math.pow(10, (ratingA - ratingB) / this.ELO_FACTOR));
    }
}
