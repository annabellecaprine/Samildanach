/**
 * Core: Rules Database
 * IndexedDB storage for game rules (Items, Spells, Abilities, etc.)
 * Refactored to use GenericDB.
 * @module Core/RulesDB
 */

import { Utils } from './utils.js';
import { GenericDB } from './generic-db.js';

const DB_NAME = 'samildanach_rules';
const RULES_STORE = 'rules';

const db = new GenericDB({
    dbName: DB_NAME,
    version: 1,
    stores: [
        {
            name: RULES_STORE,
            keyPath: 'id',
            indexes: [
                { name: 'type', keyPath: 'type' },
                { name: 'updatedAt', keyPath: 'updatedAt' }
            ]
        }
    ]
});

export const RulesDB = {

    init: function () {
        return db.init();
    },

    list: async function (filters = {}) {
        await db.init();

        let dbFilter = null;
        if (filters.type) {
            dbFilter = { index: 'type', value: filters.type };
        }

        const items = await db.list(RULES_STORE, dbFilter);
        // Sort by updatedAt descending
        return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    get: async function (id) {
        await db.init();
        return db.get(RULES_STORE, id);
    },

    add: async function (type, data) {
        await db.init();
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

        await db.add(RULES_STORE, rule);
        console.log('[RulesDB] Added rule:', id);
        return rule;
    },

    update: async function (rule) {
        await db.init();
        rule.updatedAt = new Date().toISOString();
        await db.put(RULES_STORE, rule);
        return rule;
    },

    delete: async function (id) {
        await db.init();
        await db.delete(RULES_STORE, id);
        console.log('[RulesDB] Deleted rule:', id);
    },

    exportAll: function () {
        return this.list();
    },

    importAll: function (rules) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.init();
                let count = 0;
                for (const rule of rules) {
                    try {
                        const newRule = {
                            ...rule,
                            id: Utils.generateId('rule'),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        await db.add(RULES_STORE, newRule);
                        count++;
                    } catch (e) {
                        console.warn('[RulesDB] Import skip:', e);
                    }
                }
                resolve(count);
            } catch (err) {
                reject(err);
            }
        });
    }
};
