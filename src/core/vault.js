/**
 * Samildánach Core: Vault Database
 * Purpose: IndexedDB storage for cross-project asset library (Vault).
 * Refactored to use GenericDB.
 * @module Core/VaultDB
 */

import { Utils } from './utils.js';
import { GenericDB } from './generic-db.js';

const DB_NAME = 'samildanach_vault';
const ITEMS_STORE = 'items';
const REGISTRY_STORE = 'registry';
const REGISTRY_KEY = 'vault_registry';

/**
 * Default registry document
 */
function createDefaultRegistry() {
    return {
        id: REGISTRY_KEY,
        lastUpdatedAt: new Date().toISOString(),
        universes: [],
        allTags: [],
        blocks: {},
        itemCounts: { actor: 0, lorebook: 0, script: 0, location: 0, event: 0, pair: 0 }
    };
}

const db = new GenericDB({
    dbName: DB_NAME,
    version: 1,
    stores: [
        {
            name: ITEMS_STORE,
            keyPath: 'id',
            indexes: [
                { name: 'type', keyPath: 'type' },
                { name: 'universe', keyPath: 'universe' },
                { name: 'updatedAt', keyPath: 'updatedAt' }
            ]
        },
        {
            name: REGISTRY_STORE,
            keyPath: 'id'
        }
    ]
});

export const VaultDB = {

    init: function () {
        return db.init();
    },

    getRegistry: async function () {
        await db.init();
        const reg = await db.get(REGISTRY_STORE, REGISTRY_KEY);
        if (reg) return reg;

        const def = createDefaultRegistry();
        await db.put(REGISTRY_STORE, def);
        return def;
    },

    updateRegistry: async function (updates) {
        await db.init();
        const current = await this.getRegistry();
        const updated = {
            ...current,
            ...updates,
            id: REGISTRY_KEY,
            lastUpdatedAt: new Date().toISOString()
        };
        await db.put(REGISTRY_STORE, updated);
        return updated;
    },

    list: async function (filters = {}) {
        await db.init();

        let dbFilter = null;
        if (filters.type) {
            dbFilter = { index: 'type', value: filters.type };
        } else if (filters.universe) {
            dbFilter = { index: 'universe', value: filters.universe };
        }

        const items = await db.list(ITEMS_STORE, dbFilter);

        // Client-side filtering for complex queries
        const results = items.filter(item => {
            if (filters.type && item.type !== filters.type) return false;
            if (filters.universe && item.universe !== filters.universe) return false;
            if (filters.tags && filters.tags.length > 0) {
                const hasAllTags = filters.tags.every(t => item.tags?.includes(t));
                if (!hasAllTags) return false;
            }
            return true;
        });

        // Sort by updatedAt descending
        return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    addItem: async function (type, data, metadata = {}) {
        await db.init();
        const now = new Date().toISOString();

        let id;
        try {
            id = Utils && Utils.generateId ? Utils.generateId('vault') : `vault_${crypto.randomUUID()}`;
        } catch (e) {
            id = 'vault_' + Date.now();
        }

        const vaultItem = {
            id: id,
            type: type,
            version: 1,
            universe: metadata.universe || '',
            tags: metadata.tags || [],
            createdAt: now,
            updatedAt: now,
            data: data
        };

        console.log('[VaultDB] Adding Item:', vaultItem);
        await db.add(ITEMS_STORE, vaultItem);
        return vaultItem;
    },

    updateItem: async function (item) {
        await db.init();
        item.updatedAt = new Date().toISOString();
        await db.put(ITEMS_STORE, item);
        return item;
    },

    deleteItem: async function (id) {
        await db.init();
        await db.delete(ITEMS_STORE, id);
    }
};
