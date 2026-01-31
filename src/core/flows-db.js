/**
 * Core: Flows Database
 * IndexedDB storage for Architect flows (node graphs).
 * Supports named flows that can be reused as compound nodes.
 * @module Core/FlowsDB
 */

import { Utils } from './utils.js';

const DB_NAME = 'samildanach_flows';
const DB_VERSION = 1;
const FLOWS_STORE = 'flows';

let db = null;

export const FlowsDB = {

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
                console.error('[FlowsDB] Failed to open database:', e.target.error);
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                db = e.target.result;
                console.log('[FlowsDB] Database opened successfully');
                resolve(db);
            };

            request.onupgradeneeded = (e) => {
                const database = e.target.result;

                if (!database.objectStoreNames.contains(FLOWS_STORE)) {
                    const store = database.createObjectStore(FLOWS_STORE, { keyPath: 'id' });
                    store.createIndex('updatedAt', 'updatedAt', { unique: false });
                    console.log('[FlowsDB] Flows store created');
                }
            };
        });
    },

    /**
     * List all flows
     * @returns {Promise<Array>}
     */
    list: function () {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('FlowsDB not initialized')); return; }

            const tx = db.transaction(FLOWS_STORE, 'readonly');
            const store = tx.objectStore(FLOWS_STORE);
            const request = store.openCursor();

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
     * Get a single flow by ID
     * @param {string} id
     * @returns {Promise<Object|null>}
     */
    get: function (id) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('FlowsDB not initialized')); return; }

            const tx = db.transaction(FLOWS_STORE, 'readonly');
            const store = tx.objectStore(FLOWS_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Create a new flow
     * @param {string} name
     * @returns {Promise<Object>}
     */
    create: function (name) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('FlowsDB not initialized')); return; }

            const now = new Date().toISOString();
            let id;
            try {
                id = Utils && Utils.generateId ? Utils.generateId('flow') : `flow_${crypto.randomUUID().split('-')[0]}`;
            } catch (e) {
                id = 'flow_' + Date.now();
            }

            const flow = {
                id: id,
                name: name || 'Untitled Flow',
                description: '',
                createdAt: now,
                updatedAt: now,
                version: 1,

                // Canvas data
                nodes: [],
                links: [],
                transform: { x: 0, y: 0, scale: 1 },

                // Compound node interface (auto-computed on save)
                exposedInputs: [],
                exposedOutputs: []
            };

            const tx = db.transaction(FLOWS_STORE, 'readwrite');
            const store = tx.objectStore(FLOWS_STORE);
            const request = store.add(flow);

            request.onsuccess = () => {
                console.log('[FlowsDB] Created flow:', id, name);
                resolve(flow);
            };
            request.onerror = (e) => {
                console.error('[FlowsDB] Create failed:', e.target.error);
                reject(e.target.error);
            };
        });
    },

    /**
     * Update an existing flow
     * @param {Object} flow
     * @returns {Promise<Object>}
     */
    update: function (flow) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('FlowsDB not initialized')); return; }

            flow.updatedAt = new Date().toISOString();
            flow.version = (flow.version || 0) + 1;

            // Auto-compute exposed I/O
            flow.exposedInputs = this.computeExposedInputs(flow);
            flow.exposedOutputs = this.computeExposedOutputs(flow);

            const tx = db.transaction(FLOWS_STORE, 'readwrite');
            const store = tx.objectStore(FLOWS_STORE);
            const request = store.put(flow);

            request.onsuccess = () => {
                console.log('[FlowsDB] Updated flow:', flow.id, 'v' + flow.version);
                resolve(flow);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Delete a flow by ID
     * @param {string} id
     * @returns {Promise<void>}
     */
    delete: function (id) {
        return new Promise((resolve, reject) => {
            if (!db) { reject(new Error('FlowsDB not initialized')); return; }

            const tx = db.transaction(FLOWS_STORE, 'readwrite');
            const store = tx.objectStore(FLOWS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('[FlowsDB] Deleted flow:', id);
                resolve();
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    /**
     * Compute which inputs are exposed (unconnected)
     * @param {Object} flow
     * @returns {Array<{nodeId, socket, label}>}
     */
    computeExposedInputs: function (flow) {
        const exposed = [];
        const connectedInputs = new Set();

        // Build set of connected inputs
        (flow.links || []).forEach(link => {
            connectedInputs.add(`${link.to.nodeId}:${link.to.socket}`);
        });

        // Find unconnected inputs
        (flow.nodes || []).forEach(node => {
            (node.inputs || []).forEach(socket => {
                const key = `${node.id}:${socket}`;
                if (!connectedInputs.has(key)) {
                    exposed.push({
                        nodeId: node.id,
                        socket: socket,
                        label: `${node.title}.${socket}`
                    });
                }
            });
        });

        return exposed;
    },

    /**
     * Compute which outputs are exposed (unconnected)
     * @param {Object} flow
     * @returns {Array<{nodeId, socket, label}>}
     */
    computeExposedOutputs: function (flow) {
        const exposed = [];
        const connectedOutputs = new Set();

        // Build set of connected outputs
        (flow.links || []).forEach(link => {
            connectedOutputs.add(`${link.from.nodeId}:${link.from.socket}`);
        });

        // Find unconnected outputs
        (flow.nodes || []).forEach(node => {
            (node.outputs || []).forEach(socket => {
                const key = `${node.id}:${socket}`;
                if (!connectedOutputs.has(key)) {
                    exposed.push({
                        nodeId: node.id,
                        socket: socket,
                        label: `${node.title}.${socket}`
                    });
                }
            });
        });

        return exposed;
    }
};
