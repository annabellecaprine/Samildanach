/**
 * Dev: Archives Test Utility
 * Temporary module to validate Transformers.js + Web Worker pipeline.
 * To use: import { testArchives } from './dev-archives-test.js' in main.js
 *         then call window.testArchives = testArchives;
 *         In browser console: testArchives()
 */

import { uploadDocument } from './archive-processor.js';
import { ArchivesDB } from './archives-db.js';
import { findSimilar, flattenChunks } from './vector-search.js';

const TEST_TEXT = `
# The Kingdom of Aldoria

Aldoria is a prosperous kingdom nestled between the Ironspine Mountains and the Azure Sea. 
Its capital, Crownshold, is renowned for its towering spires and bustling markets.

## The War of Shadows

In the year 892, the Dark Lord Malachar launched an assault on Aldoria. 
The kingdom's defenders, led by Queen Elara the Brave, held the line at Falcon's Pass for three months.
The war ended when the Archmage Thandril sealed Malachar in the Void Prison.

## The Current Era

King Aldric III now rules Aldoria. He is known for his just policies and his patron age of the arts.
The kingdom enjoys peace, though whispers of Malachar's return grow louder each year.
`;

/**
 * Run Archives pipeline test
 */
export async function testArchives() {
    console.log('[DevTest] Starting Archives test...');

    try {
        // 1. Upload test document
        console.log('[DevTest] Uploading test document...');
        const doc = await uploadDocument('test_aldoria.md', TEST_TEXT);
        console.log('[DevTest] Document created:', doc.id);
        console.log('[DevTest] Processing will happen in background. Check console for progress.');

        // Return test functions for manual verification
        return {
            docId: doc.id,
            checkStatus: async () => {
                const updated = await ArchivesDB.getDocument(doc.id);
                console.log('[DevTest] Status:', updated.status);
                console.log('[DevTest] Chunks:', updated.chunks?.length || 0);
                console.log('[DevTest] Vectors:', updated.vectors?.length || 0);
                return updated;
            },
            search: async (query) => {
                // This would require embedding the query too - simplified for now
                const docs = await ArchivesDB.listDocuments();
                const chunks = flattenChunks(docs);
                console.log('[DevTest] Available chunks:', chunks.length);
                // Note: Real search would embed the query first
                return chunks;
            },
            cleanup: async () => {
                await ArchivesDB.deleteDocument(doc.id);
                console.log('[DevTest] Test document deleted.');
            }
        };
    } catch (err) {
        console.error('[DevTest] ERROR:', err);
        throw err;
    }
}
