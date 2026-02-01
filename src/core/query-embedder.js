/**
 * Core: Query Embedder
 * Main-thread embedding for search queries (smaller and faster than full document processing).
 * @module Core/QueryEmbedder
 */

import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js for browser
env.allowLocalModels = false;
env.useBrowserCache = false;
env.backends.onnx.wasm.proxy = false;

let embedder = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

/**
 * Initialize the embedding pipeline (lazy load)
 */
async function getEmbedder() {
    if (!embedder) {
        console.log('[QueryEmbedder] Loading model...');
        embedder = await pipeline('feature-extraction', MODEL_NAME);
        console.log('[QueryEmbedder] Model ready');
    }
    return embedder;
}

/**
 * Embed a single query string
 * @param {string} text - The query text
 * @returns {Promise<number[]>} - The embedding vector
 */
export async function embedQuery(text) {
    const pipe = await getEmbedder();
    const output = await pipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
}
