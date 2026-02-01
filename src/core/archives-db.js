/**
 * Core: ArchivesDB
 * IndexedDB wrapper for document storage (Knowledge Base).
 * Schema: { id, filename, uploadDate, status, chunks[], vectors[], tags[], modelVersion }
 * @module Core/ArchivesDB
 */

import { GenericDB } from './generic-db.js';
import { generateId } from './utils.js';

const DB_CONFIG = {
    dbName: 'samildanach_archives',
    version: 1,
    stores: [
        {
            name: 'documents',
            keyPath: 'id',
            indexes: [
                { name: 'filename', keyPath: 'filename' },
                { name: 'status', keyPath: 'status' },
                { name: 'collectionId', keyPath: 'collectionId' }
            ]
        },
        {
            name: 'collections',
            keyPath: 'id'
        }
    ]
};

/** @type {GenericDB|null} */
let db = null;

/**
 * Document status enum
 */
export const DOC_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    READY: 'ready',
    ERROR: 'error'
};

/**
 * ArchivesDB API
 */
export const ArchivesDB = {
    /**
     * Initialize database
     */
    async init() {
        if (!db) {
            db = new GenericDB(DB_CONFIG);
        }
        return db.init();
    },

    /**
     * Add a new document
     * @param {Object} doc - { filename, rawText }
     * @returns {Promise<Object>} Created document
     */
    async addDocument(doc) {
        const now = new Date().toISOString();
        const document = {
            id: generateId(),
            filename: doc.filename,
            rawText: doc.rawText || '',
            uploadDate: now,
            status: DOC_STATUS.PENDING,
            chunks: [],
            vectors: [],
            tags: [],
            modelVersion: null,
            collectionId: doc.collectionId || null
        };
        return db.add('documents', document);
    },

    /**
     * Get document by ID
     */
    async getDocument(id) {
        return db.get('documents', id);
    },

    /**
     * Update document
     */
    async updateDocument(doc) {
        return db.put('documents', doc);
    },

    /**
     * Delete document
     */
    async deleteDocument(id) {
        return db.delete('documents', id);
    },

    /**
     * List all documents
     * @param {string} [collectionId] - Optional filter by collection
     */
    async listDocuments(collectionId) {
        if (collectionId) {
            return db.list('documents', { index: 'collectionId', value: collectionId });
        }
        return db.list('documents');
    },

    /**
     * List documents by status
     */
    async listByStatus(status) {
        return db.list('documents', { index: 'status', value: status });
    },

    // === Collections ===

    /**
     * Add a collection
     */
    async addCollection(name) {
        const collection = {
            id: generateId(),
            name,
            createdAt: new Date().toISOString()
        };
        return db.add('collections', collection);
    },

    /**
     * List all collections
     */
    async listCollections() {
        return db.list('collections');
    },

    /**
     * Delete collection
     */
    async deleteCollection(id) {
        return db.delete('collections', id);
    },

    // === Bulk Operations ===

    /**
     * Clear all documents (for testing/reset)
     */
    async clearAll() {
        const docs = await this.listDocuments();
        for (const doc of docs) {
            await this.deleteDocument(doc.id);
        }
    }
};
