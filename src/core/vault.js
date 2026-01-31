/**
 * Samildánach Core: Vault Database
 * Purpose: IndexedDB storage for cross-project asset library (Vault).
 * Stores Rules Modules, Monsters, Items, etc.
 * @module Core/VaultDB
 */

import { Utils } from './utils.js';

const DB_NAME = 'samildanach_vault';
const DB_VERSION = 1;
const ITEMS_STORE = 'items';
const REGISTRY_STORE = 'registry';
const REGISTRY_KEY = 'vault_registry';

let db = null;

/**
 * Default registry document
 */
function createDefaultRegistry() {
    return {
        id: REGISTRY_KEY,
        lastUpdatedAt: new Date().toISOString(),
        universes: [],
        allTags: [],
        blocks: {},  // { blockId: { id, name, createdAt } }
        itemCounts: {
            actor: 0,
            lorebook: 0, // Keeping legacy types for now, will expand to 'rule', 'component'
            script: 0,
            location: 0,
            event: 0,
            pair: 0
        }
    };
}

export const VaultDB = {

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
                console.error('[VaultDB] Failed to open database:', e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                db = e.target.result;
                console.log('[VaultDB] Database opened successfully');
                resolve(db);
            };

            request.onupgradeneeded = (e) => {
                const database = e.target.result;

                // Create items store with indexes
                if (!database.objectStoreNames.contains(ITEMS_STORE)) {
                    const itemsStore = database.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
                    itemsStore.createIndex('type', 'type', { unique: false });
                    itemsStore.createIndex('universe', 'universe', { unique: false });
                    itemsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    console.log('[VaultDB] Items store created');
                }

                // Create registry store (single document)
                if (!database.objectStoreNames.contains(REGISTRY_STORE)) {
                    database.createObjectStore(REGISTRY_STORE, { keyPath: 'id' });
                    console.log('[VaultDB] Registry store created');
                }
            };
        });
    },

    /**
     * Ensure registry exists, create if not
     * @returns {Promise<Object>}
     */
    getRegistry: function () {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('VaultDB not initialized')); return; }

            const tx = db.transaction(REGISTRY_STORE, 'readonly');
            const store = tx.objectStore(REGISTRY_STORE);
            const request = store.get(REGISTRY_KEY);

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    VaultDB.updateRegistry(createDefaultRegistry()).then(resolve).catch(reject);
                }
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Update registry document
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>}
     */
    updateRegistry: function (updates) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('VaultDB not initialized')); return; }

            const tx = db.transaction(REGISTRY_STORE, 'readwrite');
            const store = tx.objectStore(REGISTRY_STORE);
            const getRequest = store.get(REGISTRY_KEY);

            getRequest.onsuccess = () => {
                const current = getRequest.result || createDefaultRegistry();
                const updated = {
                    ...current,
                    ...updates,
                    id: REGISTRY_KEY,
                    lastUpdatedAt: new Date().toISOString()
                };
                const putRequest = store.put(updated);
                putRequest.onsuccess = () => resolve(updated);
                putRequest.onerror = (e) => reject(e.target.error);
            };
            getRequest.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * List all items with optional filtering
     * @param {Object} filters - { type, universe, tags }
     * @returns {Promise<Array>}
     */
    list: function (filters = {}) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('VaultDB not initialized')); return; }

            const tx = db.transaction(ITEMS_STORE, 'readonly');
            const store = tx.objectStore(ITEMS_STORE);

            let request;
            if (filters.type) {
                const index = store.index('type');
                request = index.openCursor(IDBKeyRange.only(filters.type));
            } else if (filters.universe) {
                const index = store.index('universe');
                request = index.openCursor(IDBKeyRange.only(filters.universe));
            } else {
                request = store.openCursor();
            }

            const items = [];
            request.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    const item = cursor.value;
                    let matches = true;

                    if (filters.type && item.type !== filters.type) matches = false;
                    if (filters.universe && item.universe !== filters.universe) matches = false;
                    if (filters.tags && filters.tags.length > 0) {
                        const hasAllTags = filters.tags.every(t => item.tags?.includes(t));
                        if (!hasAllTags) matches = false;
                    }

                    if (matches) items.push(item);
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
     * Add a new item to the Vault
     * @param {string} type 
     * @param {Object} data 
     * @param {Object} metadata 
     */
    addItem: function (type, data, metadata = {}) {
        return new Promise((resolve, reject) => {
            if (!db) {
                console.error('[VaultDB]AddItem: DB not initialized');
                reject(new Error('VaultDB not initialized'));
                return;
            }

            const now = new Date().toISOString();
            // Use core Utils if available, or fallback
            let id;
            try {
                id = Utils && Utils.generateId ? Utils.generateId('vault') : `vault_${crypto.randomUUID()}`;
            } catch (e) {
                console.error('[VaultDB] ID Gen Failed:', e);
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

            const tx = db.transaction(ITEMS_STORE, 'readwrite');
            const store = tx.objectStore(ITEMS_STORE);
            const request = store.add(vaultItem);

            request.onsuccess = () => {
                console.log('[VaultDB] Add Success');
                resolve(vaultItem);
            };
            request.onerror = (e) => {
                console.error('[VaultDB] Add Failed:', e.target.error);
                reject(e.target.error);
            };
        });
    },

    /**
     * Update an existing item
     * @param {Object} item 
     */
    updateItem: function (item) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('VaultDB not initialized')); return; }

            item.updatedAt = new Date().toISOString();

            const tx = db.transaction(ITEMS_STORE, 'readwrite');
            const store = tx.objectStore(ITEMS_STORE);
            const request = store.put(item);

            request.onsuccess = () => resolve(item);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Delete an item by ID
     * @param {string} id 
     */
    deleteItem: function (id) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('VaultDB not initialized')); return; }

            const tx = db.transaction(ITEMS_STORE, 'readwrite');
            const store = tx.objectStore(ITEMS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
};
