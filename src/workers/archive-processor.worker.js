/**
 * Web Worker: Archive Document Processor
 * Handles text extraction, chunking, and embedding generation in background.
 * 
 * Messages:
 *   IN: { type: 'process', payload: { id, rawText } }
 *   OUT: { type: 'progress', payload: { stage, progress } }
 *   OUT: { type: 'complete', payload: { id, chunks, vectors, modelVersion } }
 *   OUT: { type: 'error', payload: { id, message } }
 */

import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let embedder = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const MODEL_VERSION = 'v1-minilm';

/**
 * Initialize the embedding pipeline (lazy load)
 */
async function getEmbedder() {
    if (!embedder) {
        self.postMessage({ type: 'progress', payload: { stage: 'loading_model', progress: 0 } });
        embedder = await pipeline('feature-extraction', MODEL_NAME, {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    self.postMessage({
                        type: 'progress',
                        payload: { stage: 'loading_model', progress: Math.round(data.progress) }
                    });
                }
            }
        });
        self.postMessage({ type: 'progress', payload: { stage: 'model_ready', progress: 100 } });
    }
    return embedder;
}

/**
 * Split text into chunks by paragraph
 * @param {string} text 
 * @returns {string[]}
 */
function chunkByParagraph(text) {
    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

    // Merge very short paragraphs with next
    const chunks = [];
    let buffer = '';

    for (const para of paragraphs) {
        buffer += (buffer ? '\n\n' : '') + para;

        // If buffer is substantial, push it
        if (buffer.length > 200) {
            chunks.push(buffer);
            buffer = '';
        }
    }

    // Push remaining buffer
    if (buffer) {
        chunks.push(buffer);
    }

    return chunks;
}

/**
 * Generate embeddings for chunks
 * @param {string[]} chunks 
 * @returns {Promise<number[][]>}
 */
async function embedChunks(chunks) {
    const pipe = await getEmbedder();
    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
        self.postMessage({
            type: 'progress',
            payload: { stage: 'embedding', progress: Math.round((i / chunks.length) * 100) }
        });

        const output = await pipe(chunks[i], { pooling: 'mean', normalize: true });
        vectors.push(Array.from(output.data));
    }

    return vectors;
}

/**
 * Main message handler
 */
self.onmessage = async (event) => {
    const { type, payload } = event.data;

    if (type === 'process') {
        const { id, rawText } = payload;

        try {
            // Stage 1: Chunking
            self.postMessage({ type: 'progress', payload: { stage: 'chunking', progress: 0 } });
            const chunks = chunkByParagraph(rawText);
            self.postMessage({ type: 'progress', payload: { stage: 'chunking', progress: 100 } });

            if (chunks.length === 0) {
                throw new Error('No text content found in document');
            }

            // Stage 2: Embedding
            const vectors = await embedChunks(chunks);

            // Stage 3: Complete
            self.postMessage({
                type: 'complete',
                payload: { id, chunks, vectors, modelVersion: MODEL_VERSION }
            });

        } catch (err) {
            self.postMessage({
                type: 'error',
                payload: { id, message: err.message }
            });
        }
    }
};
