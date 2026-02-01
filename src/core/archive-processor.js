/**
 * Core: Archive Processor Service (Main Thread)
 * Handles document processing directly on main thread for MVP.
 * TODO: Move to Web Worker after validating Vite config.
 * @module Core/ArchiveProcessor
 */

import { pipeline, env } from '@xenova/transformers';
import { ArchivesDB, DOC_STATUS } from './archives-db.js';
import { Toast } from '../components/toast/index.js';

// Configure Transformers.js for browser
env.allowLocalModels = false;
env.useBrowserCache = false; // Disabled: causes issues in some browsers
env.backends.onnx.wasm.proxy = false;

let embedder = null;
let isProcessing = false;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const MODEL_VERSION = 'v1-minilm';

/**
 * Initialize the embedding pipeline (lazy load)
 */
async function getEmbedder() {
    if (!embedder) {
        console.log('[ArchiveProcessor] Loading embedding model...');
        Toast.show('Downloading AI model (first time only)...', 'info');

        embedder = await pipeline('feature-extraction', MODEL_NAME, {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    console.log(`[ArchiveProcessor] Model download: ${Math.round(data.progress)}%`);
                }
            }
        });

        console.log('[ArchiveProcessor] Model ready!');
        Toast.show('AI model loaded successfully', 'success');
    }
    return embedder;
}

/**
 * Split text into chunks by paragraph
 */
function chunkByParagraph(text) {
    const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

    const chunks = [];
    let buffer = '';

    for (const para of paragraphs) {
        buffer += (buffer ? '\n\n' : '') + para;

        if (buffer.length > 200) {
            chunks.push(buffer);
            buffer = '';
        }
    }

    if (buffer) {
        chunks.push(buffer);
    }

    return chunks;
}

/**
 * Generate embeddings for chunks
 */
async function embedChunks(chunks) {
    const pipe = await getEmbedder();
    const vectors = [];

    for (let i = 0; i < chunks.length; i++) {
        console.log(`[ArchiveProcessor] Embedding chunk ${i + 1}/${chunks.length}`);
        const output = await pipe(chunks[i], { pooling: 'mean', normalize: true });
        vectors.push(Array.from(output.data));
    }

    return vectors;
}

/**
 * Process a document
 */
async function processDocument(id, rawText) {
    const doc = await ArchivesDB.getDocument(id);
    if (!doc) {
        console.error('[ArchiveProcessor] Document not found:', id);
        return;
    }

    try {
        doc.status = DOC_STATUS.PROCESSING;
        await ArchivesDB.updateDocument(doc);

        // Chunking
        console.log('[ArchiveProcessor] Chunking text...');
        const chunks = chunkByParagraph(rawText);

        if (chunks.length === 0) {
            throw new Error('No text content found');
        }

        console.log(`[ArchiveProcessor] Created ${chunks.length} chunks`);

        // Embedding
        const vectors = await embedChunks(chunks);

        // Save
        doc.chunks = chunks;
        doc.vectors = vectors;
        doc.modelVersion = MODEL_VERSION;
        doc.status = DOC_STATUS.READY;
        await ArchivesDB.updateDocument(doc);

        Toast.show(`Processed: ${doc.filename}`, 'success');
        console.log('[ArchiveProcessor] Complete:', doc.filename);

    } catch (err) {
        console.error('[ArchiveProcessor] Error:', err);
        doc.status = DOC_STATUS.ERROR;
        doc.errorMessage = err.message;
        await ArchivesDB.updateDocument(doc);
        Toast.show(`Failed: ${doc.filename}`, 'error');
    }
}

/**
 * Queue a document for processing
 */
export async function queueDocument(id, rawText) {
    // Simple sequential processing for now
    if (isProcessing) {
        console.log('[ArchiveProcessor] Already processing, queuing...');
        setTimeout(() => queueDocument(id, rawText), 1000);
        return;
    }

    isProcessing = true;
    await processDocument(id, rawText);
    isProcessing = false;
}

/**
 * Upload and queue a document for processing
 */
export async function uploadDocument(filename, rawText) {
    await ArchivesDB.init();
    const doc = await ArchivesDB.addDocument({ filename, rawText });
    await queueDocument(doc.id, rawText);
    return doc;
}
