/**
 * Core Dice Roller
 * Parses and evaluates dice expressions (NdX+Y format).
 * @module Core/Dice
 */

export const Dice = {
    /**
     * Parse a dice expression
     * @param {string} expr - e.g. "2d6+3", "1d20", "3d8-2"
     * @returns {Object|null} Parsed components or null if invalid
     */
    parse(expr) {
        const match = expr.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
        if (!match) return null;

        return {
            count: parseInt(match[1]) || 1,
            sides: parseInt(match[2]),
            modifier: parseInt(match[3]) || 0
        };
    },

    /**
     * Roll a single die
     * @param {number} sides 
     * @returns {number}
     */
    rollOne(sides) {
        return Math.floor(Math.random() * sides) + 1;
    },

    /**
     * Roll multiple dice
     * @param {number} count 
     * @param {number} sides 
     * @returns {number[]}
     */
    rollMany(count, sides) {
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.rollOne(sides));
        }
        return results;
    },

    /**
     * Evaluate a dice expression
     * @param {string} expr - e.g. "2d6+3"
     * @returns {Object} Result with rolls, subtotal, modifier, total
     */
    roll(expr) {
        const parsed = this.parse(expr);
        if (!parsed) {
            return { error: 'Invalid format. Use NdX or NdX+Y (e.g., 2d6+3)' };
        }

        const rolls = this.rollMany(parsed.count, parsed.sides);
        const subtotal = rolls.reduce((a, b) => a + b, 0);
        const total = subtotal + parsed.modifier;

        return {
            expression: expr,
            rolls,
            subtotal,
            modifier: parsed.modifier,
            total
        };
    },

    /**
     * Format a roll result as a string
     * @param {Object} result 
     * @returns {string}
     */
    format(result) {
        if (result.error) return result.error;

        let str = `[${result.rolls.join(', ')}]`;
        if (result.modifier !== 0) {
            str += ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`;
        }
        str += ` = ${result.total}`;
        return str;
    },

    /**
     * Calculate statistics for a dice expression
     * @param {string} expr 
     * @returns {Object} min, max, average
     */
    stats(expr) {
        const parsed = this.parse(expr);
        if (!parsed) return null;

        const min = parsed.count + parsed.modifier;
        const max = (parsed.count * parsed.sides) + parsed.modifier;
        const average = ((min + max) / 2);

        return { min, max, average: average.toFixed(1) };
    }
};
