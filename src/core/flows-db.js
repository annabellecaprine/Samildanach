/**
 * Core: Flows Database
 * IndexedDB storage for Architect flows.
 * Refactored to use GenericDB.
 * @module Core/FlowsDB
 */

import { Utils } from './utils.js';
import { GenericDB } from './generic-db.js';

const DB_NAME = 'samildanach_flows';
const FLOWS_STORE = 'flows';

const db = new GenericDB({
    dbName: DB_NAME,
    version: 1,
    stores: [
        {
            name: FLOWS_STORE,
            keyPath: 'id',
            indexes: [
                { name: 'updatedAt', keyPath: 'updatedAt' }
            ]
        }
    ]
});

export const FlowsDB = {

    init: function () {
        return db.init();
    },

    list: async function () {
        await db.init();
        const items = await db.getAll(FLOWS_STORE);
        return items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    },

    get: async function (id) {
        await db.init();
        return db.get(FLOWS_STORE, id);
    },

    create: async function (name) {
        await db.init();
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
            nodes: [],
            links: [],
            transform: { x: 0, y: 0, scale: 1 },
            exposedInputs: [],
            exposedOutputs: []
        };

        await db.add(FLOWS_STORE, flow);
        console.log('[FlowsDB] Created flow:', id);
        return flow;
    },

    update: async function (flow) {
        await db.init();
        flow.updatedAt = new Date().toISOString();
        flow.version = (flow.version || 0) + 1;

        // Auto-compute exposed I/O
        flow.exposedInputs = this.computeExposedInputs(flow);
        flow.exposedOutputs = this.computeExposedOutputs(flow);

        await db.put(FLOWS_STORE, flow);
        return flow;
    },

    delete: async function (id) {
        await db.init();
        await db.delete(FLOWS_STORE, id);
        console.log('[FlowsDB] Deleted flow:', id);
    },

    // --- Domain Logic helpers ---

    computeExposedInputs: function (flow) {
        const exposed = [];
        const connectedInputs = new Set();
        (flow.links || []).forEach(link => {
            connectedInputs.add(`${link.to.nodeId}:${link.to.socket}`);
        });

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

    computeExposedOutputs: function (flow) {
        const exposed = [];
        const connectedOutputs = new Set();
        (flow.links || []).forEach(link => {
            connectedOutputs.add(`${link.from.nodeId}:${link.from.socket}`);
        });

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
