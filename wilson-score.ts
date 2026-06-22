export interface Review {
    stars: number;
    createdAt: Date;
}

export interface FreelancerStats {
    reviews: Review[];
    completedProjects: number;
    totalStarted: number;
    lastActive: Date;
}

export class RatingSystem {
    private readonly WEIGHTS = {
        SATISFACTION: 0.5,
        RELIABILITY: 0.2,
        EXPERIENCE: 0.2,
        ACTIVITY: 0.1 
    };

    public calculate(stats: FreelancerStats): number {
        if (stats.totalStarted === 0) return 0;

        const scores = {
            satisfaction: this.getWilsonScore(stats.reviews),
            reliability: this.getReliabilityScore(stats.completedProjects, stats.totalStarted),
            experience: this.getExperienceScore(stats.completedProjects),
            activity: this.getActivityScore(stats.lastActive)
        };

        const finalScore = 
            (scores.satisfaction * this.WEIGHTS.SATISFACTION) +
            (scores.reliability * this.WEIGHTS.RELIABILITY) +
            (scores.experience * this.WEIGHTS.EXPERIENCE) +
            (scores.activity * this.WEIGHTS.ACTIVITY);

        return Math.round(finalScore * 10) / 10;
    }

    private getWilsonScore(reviews: Review[]): number {
        const n = reviews.length;
        if (n === 0) return 0;

        const upvotes = reviews.filter(r => r.stars >= 4).length;
        const z = 1.96;
        const p = upvotes / n;

        const left = p + (z * z) / (2 * n);
        const right = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
        const under = 1 + (z * z) / n;

        return ((left - right) / under) * 100;
    }

    private getReliabilityScore(completed: number, total: number): number {
        return (completed / total) * 100;
    }

    private getExperienceScore(completed: number): number {
        if (completed === 0) return 0;
        const score = (Math.log(completed + 1) / Math.log(50)) * 100;
        return Math.min(100, score);
    }

    private getActivityScore(lastActive: Date): number {
        const daysInactivity = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        if (daysInactivity <= 30) return 100;
        
        return Math.max(0, 100 - (daysInactivity - 30) * 2);
    }
}