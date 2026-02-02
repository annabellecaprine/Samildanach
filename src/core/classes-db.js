/**
 * Core: Classes Database
 * IndexedDB storage for RPG Class templates.
 * Uses GenericDB.
 * @module Core/ClassesDB
 */

import { Utils } from './utils.js';
import { GenericDB } from './generic-db.js';

const DB_NAME = 'samildanach_classes';
const CLASSES_STORE = 'classes';

const db = new GenericDB({
    dbName: DB_NAME,
    version: 1,
    stores: [
        {
            name: CLASSES_STORE,
            keyPath: 'id',
            indexes: [
                { name: 'name', keyPath: 'name' },
                { name: 'updatedAt', keyPath: 'updatedAt' }
            ]
        }
    ]
});

export const ClassesDB = {

    init: function () {
        return db.init();
    },

    list: async function (filters = {}) {
        await db.init();
        const items = await db.list(CLASSES_STORE) || [];
        // Sort by name alphabetically
        return items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    },

    get: async function (id) {
        await db.init();
        return db.get(CLASSES_STORE, id);
    },

    add: async function (data) {
        await db.init();
        const now = new Date().toISOString();

        let id;
        try {
            id = (Utils && Utils.generateId) ? Utils.generateId('class') : `class_${Date.now()}`;
        } catch (e) {
            id = `class_${Date.now()}`;
        }

        const newClass = {
            id: id,
            name: data.name || 'New Class',
            description: data.description || '',
            hitDie: data.hitDie || 'd8',
            primaryAbility: data.primaryAbility || '',
            progression: data.progression || [], // Level 1-20 array
            createdAt: now,
            updatedAt: now,
            ...data
        };

        // Ensure IDs match if passed in data
        newClass.id = id;

        await db.add(CLASSES_STORE, newClass);
        console.log('[ClassesDB] Added class:', id);
        return newClass;
    },

    update: async function (item) {
        await db.init();
        item.updatedAt = new Date().toISOString();
        await db.put(CLASSES_STORE, item);
        return item;
    },

    delete: async function (id) {
        await db.init();
        await db.delete(CLASSES_STORE, id);
        console.log('[ClassesDB] Deleted class:', id);
    },

    // Import/Export hooks
    exportAll: function () {
        return this.list();
    },

    importAll: function (items) {
        return new Promise(async (resolve, reject) => {
            try {
                await db.init();
                let count = 0;
                for (const item of items) {
                    try {
                        // Resizing IDs if needed or keeping them safely
                        // For classes, we might want to keep IDs if they are referenced elsewhere.
                        // But standard import behavior in this app usually generates new IDs to avoid collision?
                        // Let's assume we want to clone them as new items for now, unless preserving exact state.
                        // Actually, looking at RulesDB, it generates new IDs.
                        const newItem = {
                            ...item,
                            id: Utils.generateId ? Utils.generateId('class') : `class_${Date.now()}_${Math.random()}`,
                            updatedAt: new Date().toISOString()
                        };
                        await db.add(CLASSES_STORE, newItem);
                        count++;
                    } catch (e) {
                        console.warn('[ClassesDB] Import skip:', e);
                    }
                }
                resolve(count);
            } catch (err) {
                reject(err);
            }
        });
    }
};
