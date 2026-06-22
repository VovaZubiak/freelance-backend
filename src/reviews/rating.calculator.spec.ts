import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RatingCalculator, FreelancerStats } from './rating.calculator';

describe('RatingCalculator (Unit Tests)', () => {
    let calculator: RatingCalculator;

    beforeEach(() => {
        calculator = new RatingCalculator();
    });

    it('повинен повертати 0, якщо фрілансер не розпочав жодного проекту', () => {
        const stats: FreelancerStats = {
            reviews: [],
            completedProjects: 0,
            totalStarted: 0,
            lastActive: new Date()
        };
        const score = calculator.calculate(stats);
        assert.strictEqual(score, 0);
    });

    it('повинен розраховувати високий рейтинг для ідеального фрілансера', () => {
        const stats: FreelancerStats = {
            reviews: [
                { stars: 5, createdAt: new Date() },
                { stars: 5, createdAt: new Date() },
                { stars: 4, createdAt: new Date() }
            ],
            completedProjects: 10,
            totalStarted: 10,
            lastActive: new Date()
        };
        const score = calculator.calculate(stats);
        assert(score > 2.5);
        assert(score <= 5.0);
    });

    it('повинен  штрафувати фрілансера, який зриває дедлайни', () => {
        const stats: FreelancerStats = {
            reviews: [{ stars: 5, createdAt: new Date() }],
            completedProjects: 1,
            totalStarted: 5,
            lastActive: new Date()
        };
        const score = calculator.calculate(stats);
        assert(score < 3.0);
    });

    it('повинен знімати бали за тривалу неактивність', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 50);

        const stats: FreelancerStats = {
            reviews: [{ stars: 5, createdAt: new Date() }],
            completedProjects: 10,
            totalStarted: 10,
            lastActive: pastDate
        };
        
        const score = calculator.calculate(stats);
        assert(score < 5.0);
    });
});
