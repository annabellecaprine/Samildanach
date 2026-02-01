/**
 * Core: Vector Search Utilities
 * Cosine similarity for finding relevant chunks.
 * @module Core/VectorSearch
 */

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} a - First vector
 * @param {number[]} b - Second vector
 * @returns {number} Similarity score (0-1)
 */
export function cosineSimilarity(a, b) {
    if (a.length !== b.length) {
        console.warn('[VectorSearch] Vector length mismatch:', a.length, 'vs', b.length);
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Find top K most similar chunks to a query vector
 * @param {number[]} queryVector - The query embedding
 * @param {Array<{id: string, vector: number[], text: string}>} chunks - Indexed chunks
 * @param {number} topK - Number of results to return
 * @returns {Array<{id: string, text: string, score: number}>}
 */
export function findSimilar(queryVector, chunks, topK = 5) {
    const scored = chunks.map(chunk => ({
        id: chunk.id,
        text: chunk.text,
        docId: chunk.docId,
        score: cosineSimilarity(queryVector, chunk.vector)
    }));

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK);
}

/**
 * Aggregate chunks from ArchivesDB for vector search
 * @param {Array} documents - Documents from ArchivesDB
 * @returns {Array<{id: string, docId: string, vector: number[], text: string}>}
 */
export function flattenChunks(documents) {
    const result = [];
    for (const doc of documents) {
        if (doc.status !== 'ready' || !doc.vectors || !doc.chunks) continue;

        for (let i = 0; i < doc.chunks.length; i++) {
            result.push({
                id: `${doc.id}_chunk_${i}`,
                docId: doc.id,
                docName: doc.filename,
                text: doc.chunks[i],
                vector: doc.vectors[i]
            });
        }
    }
    return result;
}
