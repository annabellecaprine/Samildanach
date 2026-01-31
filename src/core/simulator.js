/**
 * Core Simulator
 * Executes node graphs multiple times to verify probability distributions.
 * @module Core/Simulator
 */

import { Dice } from './dice.js';

export const Simulator = {
    /**
     * Run a simple dice expression simulation
     * @param {string} expression - Dice expression (e.g., "2d6+3")
     * @param {number} iterations - Number of times to roll
     * @returns {Object} Results with distribution and statistics
     */
    runDiceSimulation(expression, iterations = 1000) {
        const results = [];
        const distribution = {};

        for (let i = 0; i < iterations; i++) {
            const roll = Dice.roll(expression);
            if (roll.error) {
                return { error: roll.error };
            }
            results.push(roll.total);
            distribution[roll.total] = (distribution[roll.total] || 0) + 1;
        }

        // Calculate statistics
        const sorted = [...results].sort((a, b) => a - b);
        const sum = results.reduce((a, b) => a + b, 0);
        const mean = sum / iterations;

        // Standard deviation
        const squaredDiffs = results.map(v => Math.pow(v - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / iterations;
        const stdDev = Math.sqrt(avgSquaredDiff);

        // Mode (most frequent)
        let mode = null;
        let maxCount = 0;
        for (const [val, count] of Object.entries(distribution)) {
            if (count > maxCount) {
                maxCount = count;
                mode = parseInt(val);
            }
        }

        // Median
        const median = iterations % 2 === 0
            ? (sorted[iterations / 2 - 1] + sorted[iterations / 2]) / 2
            : sorted[Math.floor(iterations / 2)];

        // Percentiles
        const p25 = sorted[Math.floor(iterations * 0.25)];
        const p75 = sorted[Math.floor(iterations * 0.75)];

        return {
            expression,
            iterations,
            results,
            distribution,
            stats: {
                min: sorted[0],
                max: sorted[sorted.length - 1],
                mean: mean.toFixed(2),
                median,
                mode,
                stdDev: stdDev.toFixed(2),
                p25,
                p75
            }
        };
    },

    /**
     * Generate histogram data for visualization
     * @param {Object} simulationResult - Result from runDiceSimulation
     * @returns {Array} Array of { value, count, percentage }
     */
    getHistogramData(simulationResult) {
        if (simulationResult.error) return [];

        const { distribution, iterations, stats } = simulationResult;
        const data = [];

        for (let val = stats.min; val <= stats.max; val++) {
            const count = distribution[val] || 0;
            data.push({
                value: val,
                count,
                percentage: ((count / iterations) * 100).toFixed(1)
            });
        }

        return data;
    },

    /**
     * Compare two dice expressions
     * @param {string} expr1 
     * @param {string} expr2 
     * @param {number} iterations 
     * @returns {Object} Comparison results
     */
    compare(expr1, expr2, iterations = 1000) {
        const result1 = this.runDiceSimulation(expr1, iterations);
        const result2 = this.runDiceSimulation(expr2, iterations);

        if (result1.error || result2.error) {
            return { error: result1.error || result2.error };
        }

        // How often does expr1 beat expr2?
        let wins1 = 0, wins2 = 0, ties = 0;
        for (let i = 0; i < iterations; i++) {
            if (result1.results[i] > result2.results[i]) wins1++;
            else if (result2.results[i] > result1.results[i]) wins2++;
            else ties++;
        }

        return {
            expr1: { expression: expr1, stats: result1.stats },
            expr2: { expression: expr2, stats: result2.stats },
            comparison: {
                wins1,
                wins2,
                ties,
                win1Pct: ((wins1 / iterations) * 100).toFixed(1),
                win2Pct: ((wins2 / iterations) * 100).toFixed(1),
                tiePct: ((ties / iterations) * 100).toFixed(1)
            }
        };
    }
};
