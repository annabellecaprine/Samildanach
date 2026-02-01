/**
 * Core: Auto-Tagger
 * TF-IDF based keyword extraction for document auto-tagging.
 * @module Core/AutoTagger
 */

// Common English stop words to exclude
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
    'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
    'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
    'then', 'once', 'if', 'because', 'until', 'while', 'about', 'after', 'before',
    'above', 'below', 'between', 'into', 'through', 'during', 'under', 'again',
    'out', 'up', 'down', 'off', 'over', 'any', 'much', 'many', 'being', 'him', 'her',
    'my', 'your', 'his', 'our', 'their', 'me', 'us', 'them', 'said', 'like', 'get',
    'got', 'make', 'made', 'go', 'going', 'gone', 'went', 'come', 'came', 'back',
    'still', 'even', 'well', 'way', 'take', 'took', 'see', 'saw', 'know', 'knew',
    'one', 'two', 'first', 'new', 'good', 'time', 'man', 'day', 'thing', 'say'
]);

/**
 * Tokenize text into words
 */
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate term frequency for a document
 */
function termFrequency(tokens) {
    const tf = {};
    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }
    return tf;
}

/**
 * Extract top N keywords from document text using TF scoring
 * @param {string} text - Document text
 * @param {number} topN - Number of tags to suggest
 * @returns {string[]} - Suggested tags
 */
export function extractKeywords(text, topN = 5) {
    const tokens = tokenize(text);
    if (tokens.length === 0) return [];

    const tf = termFrequency(tokens);

    // Sort by frequency and filter out numbers
    const sorted = Object.entries(tf)
        .filter(([word]) => !/^\d+$/.test(word))
        .sort((a, b) => b[1] - a[1]);

    // Get top N, prefer longer words (more likely to be meaningful)
    const candidates = sorted.slice(0, topN * 3);

    // Score by frequency * log(length) to favor meaningful terms
    const scored = candidates.map(([word, freq]) => ({
        word,
        score: freq * Math.log(word.length + 1)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topN).map(item => item.word);
}

/**
 * Suggest tags for a document, excluding already-applied tags
 * @param {string} text - Document text  
 * @param {string[]} existingTags - Tags already applied
 * @param {number} topN - Number of suggestions
 * @returns {string[]} - Suggested new tags
 */
export function suggestTags(text, existingTags = [], topN = 5) {
    const existing = new Set(existingTags.map(t => t.toLowerCase()));
    const keywords = extractKeywords(text, topN + existing.size);

    return keywords
        .filter(kw => !existing.has(kw))
        .slice(0, topN);
}
