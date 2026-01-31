/**
 * Core: Generic IndexedDB Wrapper
 * Abstracts common DB operations to reduce duplication across Vault, Rules, and Flows.
 * @module Core/GenericDB
 */

export class GenericDB {
    /**
     * @param {Object} config
     * @param {string} config.dbName
     * @param {number} config.version
     * @param {Array<{name:string, keyPath:string, indexes:Array}>} config.stores
     */
    constructor(config) {
        this.config = config;
        this.db = null;
    }

    /**
     * Initialize DB connection
     * @returns {Promise<IDBDatabase>}
     */
    init() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.config.dbName, this.config.version);

            request.onerror = (e) => {
                console.error(`[GenericDB:${this.config.dbName}] Open Failed:`, e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                // console.log(`[GenericDB:${this.config.dbName}] Opened successfully`);
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                this.config.stores.forEach(storeDef => {
                    if (!db.objectStoreNames.contains(storeDef.name)) {
                        const store = db.createObjectStore(storeDef.name, { keyPath: storeDef.keyPath || 'id' });

                        if (storeDef.indexes) {
                            storeDef.indexes.forEach(idx => {
                                store.createIndex(idx.name, idx.keyPath || idx.name, idx.options || { unique: false });
                            });
                        }
                        console.log(`[GenericDB:${this.config.dbName}] Created store: ${storeDef.name}`);
                    }
                });
            };
        });
    }

    /**
     * Get item by ID
     * @param {string} storeName 
     * @param {string} id 
     * @returns {Promise<Object|null>}
     */
    get(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));
            const tx = this.db.transaction(storeName, 'readonly');
            const request = tx.objectStore(storeName).get(id);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Add new item
     * @param {string} storeName 
     * @param {Object} item 
     * @returns {Promise<Object>}
     */
    add(storeName, item) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));
            const tx = this.db.transaction(storeName, 'readwrite');
            const request = tx.objectStore(storeName).add(item);
            request.onsuccess = () => resolve(item);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Update existing item (Put)
     * @param {string} storeName 
     * @param {Object} item 
     * @returns {Promise<Object>}
     */
    put(storeName, item) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));
            const tx = this.db.transaction(storeName, 'readwrite');
            const request = tx.objectStore(storeName).put(item);
            request.onsuccess = () => resolve(item);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * Delete item by ID
     * @param {string} storeName 
     * @param {string} id 
     * @returns {Promise<void>}
     */
    delete(storeName, id) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));
            const tx = this.db.transaction(storeName, 'readwrite');
            const request = tx.objectStore(storeName).delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * List items, optionally filtering by an exact match on an index
     * @param {string} storeName 
     * @param {Object} [filter] - { index: 'type', value: 'foo' }
     * @returns {Promise<Array>}
     */
    list(storeName, filter) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error('DB not initialized'));

            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            let request;

            if (filter && filter.index && filter.value) {
                const index = store.index(filter.index);
                request = index.openCursor(IDBKeyRange.only(filter.value));
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
                    resolve(items);
                }
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    /**
     * List all items from store (helper)
     * @param {string} storeName 
     */
    async getAll(storeName) {
        return this.list(storeName);
    }
}
