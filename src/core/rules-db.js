/**
 * Core: Rules Database
 * IndexedDB storage for game rules (Items, Spells, Abilities, etc.)
 * Separate from VaultDB (lore entries) to maintain clean separation.
 * @module Core/RulesDB
 */

import { Utils } from './utils.js';

const DB_NAME = 'samildanach_rules';
const DB_VERSION = 1;
const RULES_STORE = 'rules';

let db = null;

export const RulesDB = {

    /**
     * Initialize IndexedDB connection
     * @returns {Promise<IDBDatabase>}
     */
    init: function () {
        return new Promise((resolve, reject) => {
            if (db) {
                resolve(db);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (e) => {
                console.error('[RulesDB] Failed to open database:', e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                db = e.target.result;
                console.log('[RulesDB] Database opened successfully');
                resolve(db);
            };

            request.onupgradeneeded = (e) => {
                const database = e.target.result;

                if (!database.objectStoreNames.contains(RULES_STORE)) {
                    const store = database.createObjectStore(RULES_STORE, { keyPath: 'id' });
                    store.createIndex('type', 'type', { unique: false });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    console.log('[RulesDB] Rules store created');
                }
            };
        });
    },

    /**
     * List all rules with optional type filter
     * @param {Object} filters - { type }
     * @returns {Promise<Array>}
     */
    list: function (filters = {}) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            const tx = db.transaction(RULES_STORE, 'readonly');
            const store = tx.objectStore(RULES_STORE);

            let request;
            if (filters.type) {
                const index = store.index('type');
                request = index.openCursor(IDBKeyRange.only(filters.type));
            } else {
                request = store.openCursor();
            }

            const items = [];
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    items.push(cursor.value);
                    cursor.continue();
                } else {
                    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                    resolve(items);
                }
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Get a single rule by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    get: function (id) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            const tx = db.transaction(RULES_STORE, 'readonly');
            const store = tx.objectStore(RULES_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Add a new rule
     * @param {string} type - item, spell, ability, condition, rule
     * @param {Object} data - Rule data
     * @returns {Promise<Object>}
     */
    add: function (type, data) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            const now = new Date().toISOString();
            let id;
            try {
                id = Utils && Utils.generateId ? Utils.generateId('rule') : `rule_${crypto.randomUUID().split('-')[0]}`;
            } catch (e) {
                id = 'rule_' + Date.now();
            }

            const rule = {
                id: id,
                type: type,
                createdAt: now,
                updatedAt: now,
                data: data
            };

            const tx = db.transaction(RULES_STORE, 'readwrite');
            const store = tx.objectStore(RULES_STORE);
            const request = store.add(rule);

            request.onsuccess = () => {
                console.log('[RulesDB] Added rule:', id);
                resolve(rule);
            };
            request.onerror = (e) => {
                console.error('[RulesDB] Add failed:', e.target.error);
                reject(e.target.error);
            };
        });
    },

    /**
     * Update an existing rule
     * @param {Object} rule
     * @returns {Promise<Object>}
     */
    update: function (rule) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            rule.updatedAt = new Date().toISOString();

            const tx = db.transaction(RULES_STORE, 'readwrite');
            const store = tx.objectStore(RULES_STORE);
            const request = store.put(rule);

            request.onsuccess = () => resolve(rule);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Delete a rule by ID
     * @param {string} id
     * @returns {Promise<void>}
     */
    delete: function (id) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            const tx = db.transaction(RULES_STORE, 'readwrite');
            const store = tx.objectStore(RULES_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('[RulesDB] Deleted rule:', id);
                resolve();
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Export all rules as JSON
     * @returns {Promise<Array>}
     */
    exportAll: function () {
        return this.list();
    },

    /**
     * Import rules from JSON array
     * @param {Array} rules
     * @returns {Promise<number>} - Number of imported rules
     */
    importAll: function (rules) {
        return new Promise(async (resolve, reject) => {
            if (!db) { reject(new Error('RulesDB not initialized')); return; }

            let count = 0;
            for (const rule of rules) {
                try {
                    // Generate new ID to avoid conflicts
                    const newRule = {
                        ...rule,
                        id: Utils.generateId('rule'),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await this.add(newRule.type, newRule.data);
                    count++;
                } catch (e) {
                    console.warn('[RulesDB] Import skip:', e);
                }
            }
            resolve(count);
        });
    }
};
