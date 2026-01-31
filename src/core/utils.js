/**
 * Core Utilities
 * Shared library for common functions used across multiple panels.
 * @module Core/Utils
 */

export const Utils = {

    /**
     * Generate a unique ID with a prefix
     * @param {string} prefix - e.g. "item", "actor"
     * @returns {string} - e.g. "item_a1b2c3d4"
     */
    generateId: (prefix = 'id') => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return `${prefix}_${crypto.randomUUID().split('-')[0]}`;
        }
        return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
    },

    /**
     * Safely escape HTML string
     * @param {string} str 
     * @returns {string}
     */
    escapeHtml: (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Debounce a function
     * @param {Function} fn 
     * @param {number} delay 
     * @returns {Function}
     */
    debounce: (fn, delay = 300) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    },

    /**
     * Deep clone an object
     * @param {Object} obj 
     * @returns {Object}
     */
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Format a date for display
     * @param {Date|string} date 
     * @returns {string}
     */
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    },

    /**
     * Truncate a string
     * @param {string} str 
     * @param {number} maxLength 
     * @returns {string}
     */
    truncate: (str, maxLength = 50) => {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    }
};

// Convenience export for common function
export const generateId = Utils.generateId;
