/**
 * Core: Cross-Linker
 * Scans Archive documents for Library entry names and suggests links.
 * @module Core/CrossLinker
 */

import { VaultDB } from './vault.js';

/**
 * Build a map of Library entry names to their IDs
 * @returns {Promise<Map<string, {id: string, name: string, type: string}>>}
 */
export async function buildLibraryNameMap() {
    await VaultDB.init();
    const entries = await VaultDB.list();

    const nameMap = new Map();
    for (const entry of entries) {
        const name = entry.data?.name;
        if (name && name.length >= 3) { // Skip very short names
            // Store lowercase for matching, but keep original for display
            nameMap.set(name.toLowerCase(), {
                id: entry.id,
                name: name,
                type: entry.type
            });
        }
    }
    return nameMap;
}

/**
 * Scan text for Library entry names
 * @param {string} text - Document text to scan
 * @param {Map} nameMap - Map from buildLibraryNameMap()
 * @returns {Array<{name: string, id: string, type: string, count: number}>}
 */
export function findLibraryReferences(text, nameMap) {
    const found = new Map();
    const textLower = text.toLowerCase();

    for (const [nameLower, entry] of nameMap) {
        // Use word boundary matching to avoid partial matches
        // e.g. "King" shouldn't match inside "Kingdom"
        const regex = new RegExp(`\\b${escapeRegex(nameLower)}\\b`, 'gi');
        const matches = textLower.match(regex);

        if (matches && matches.length > 0) {
            found.set(entry.id, {
                ...entry,
                count: matches.length
            });
        }
    }

    // Sort by count (most mentioned first)
    return Array.from(found.values())
        .sort((a, b) => b.count - a.count);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scan a document's text and return Library references
 * @param {Object} doc - Archive document
 * @returns {Promise<Array>} - Found references
 */
export async function scanDocumentForLinks(doc) {
    const text = doc.rawText || (doc.chunks || []).join('\n\n');
    if (!text) return [];

    const nameMap = await buildLibraryNameMap();
    return findLibraryReferences(text, nameMap);
}
