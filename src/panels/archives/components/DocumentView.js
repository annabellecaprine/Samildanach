/**
 * Component: DocumentView
 * Detail view for a selected Archive document.
 * Shows metadata, tags, and chunk preview.
 */

import { Utils } from '../../../core/utils.js';
import { Modal } from '../../../components/modal/index.js';
import { suggestTags } from '../../../core/auto-tagger.js';
import { scanDocumentForLinks } from '../../../core/cross-linker.js';
import { embedQuery } from '../../../core/query-embedder.js';
import { findSimilar, flattenChunks } from '../../../core/vector-search.js';
import { LLM } from '../../../core/llm.js';

export class DocumentView {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.document = null;
    }

    showEmpty() {
        this.document = null;
        this.container.innerHTML = `
            <div class="doc-view-empty">
                <div class="empty-icon">📄</div>
                <div class="empty-text">Select a document to view</div>
            </div>
        `;
    }

    setDocument(doc, collections = []) {
        this.document = doc;
        this.collections = collections || this.options.collections || [];
        this.render();
    }

    render() {
        if (!this.document) {
            this.showEmpty();
            return;
        }

        const doc = this.document;
        const tagsHtml = (doc.tags || []).map(tag => `
            <span class="tag">${Utils.escapeHtml(tag)} <button class="tag-remove" data-tag="${Utils.escapeHtml(tag)}">×</button></span>
        `).join('');

        const collectionsOptions = (this.collections || []).map(c =>
            `<option value="${c.id}" ${doc.collectionId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`
        ).join('');

        this.container.innerHTML = `
            <div class="doc-view">
                <div class="doc-view-header">
                    <h2 class="doc-title">${Utils.escapeHtml(doc.filename)}</h2>
                    <div class="header-actions">
                        <button id="btn-ask-doc" class="btn btn-primary btn-sm">💬 Ask</button>
                        <button id="btn-delete-doc" class="btn btn-ghost btn-sm">🗑️ Delete</button>
                    </div>
                </div>

                <div class="doc-meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Status</div>
                        <div class="meta-value">${doc.status}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Uploaded</div>
                        <div class="meta-value">${new Date(doc.uploadDate).toLocaleDateString()}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Chunks</div>
                        <div class="meta-value">${doc.chunks?.length || 0}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Collection</div>
                        <select id="doc-collection" class="input input-sm">
                            <option value="">Uncategorized</option>
                            ${collectionsOptions}
                        </select>
                    </div>
                </div>

                <div class="doc-section">
                        <div class="section-header">
                        <h3 class="section-title">Tags</h3>
                        <div class="section-actions">
                            <button id="btn-suggest-tags" class="btn btn-ghost btn-sm">✨ Suggest</button>
                            <button id="btn-add-tag" class="btn btn-ghost btn-sm">+ Add</button>
                        </div>
                    </div>
                    <div id="tags-container" class="tags-container">
                        ${tagsHtml || '<span class="text-muted">No tags</span>'}
                    </div>
                </div>

                <div class="doc-section">
                    <div class="section-header">
                        <h3 class="section-title">Library Links</h3>
                        <button id="btn-scan-links" class="btn btn-ghost btn-sm">🔍 Scan</button>
                    </div>
                    <div id="library-links" class="library-links">
                        <span class="text-muted">Click Scan to find Library entries</span>
                    </div>
                </div>

                <div class="doc-section">
                    <h3 class="section-title">Chunks Preview</h3>
                    <div class="chunks-list">
                        ${(doc.chunks || []).slice(0, 10).map((chunk, i) => `
                            <div class="chunk-item">
                                <div class="chunk-num">#${i + 1}</div>
                                <div class="chunk-text">${Utils.escapeHtml(chunk.substring(0, 200))}${chunk.length > 200 ? '...' : ''}</div>
                            </div>
                        `).join('')}
                        ${(doc.chunks?.length > 10) ? `<div class="text-muted">... and ${doc.chunks.length - 10} more chunks</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Delete handler
        this.container.querySelector('#btn-delete-doc').onclick = async () => {
            const confirmed = await Modal.confirm('Delete Document', `Are you sure you want to delete "${doc.filename}"?`);
            if (confirmed && this.options.onDelete) {
                await this.options.onDelete(doc);
            }
        };

        // Collection change handler
        this.container.querySelector('#doc-collection').onchange = async (e) => {
            if (this.options.onCollectionChange) {
                await this.options.onCollectionChange(doc, e.target.value || null);
            }
        };

        // Add tag handler
        this.container.querySelector('#btn-add-tag').onclick = async () => {
            const value = await Modal.prompt('Add Tag', 'Enter tag name:');
            if (value && value.trim()) {
                const tag = value.trim();
                if (!doc.tags) doc.tags = [];
                if (!doc.tags.includes(tag)) {
                    doc.tags.push(tag);
                    if (this.options.onTagsChange) {
                        await this.options.onTagsChange(doc, doc.tags);
                    }
                    this.render();
                }
            }
        };

        // Suggest tags handler (auto-tagging)
        this.container.querySelector('#btn-suggest-tags').onclick = async () => {
            const text = doc.rawText || (doc.chunks || []).join('\n\n');
            if (!text) return;

            const suggestions = suggestTags(text, doc.tags || [], 5);
            if (suggestions.length === 0) {
                Toast.show('No new tags found', 'info');
                return;
            }

            // Show suggestions to user
            const tagsHtml = suggestions.map(tag =>
                `<label class="suggestion-item"><input type="checkbox" value="${tag}" checked> ${tag}</label>`
            ).join('');

            const content = document.createElement('div');
            content.innerHTML = `<p>Suggested tags based on document content:</p><div class="suggestion-list">${tagsHtml}</div>`;

            const modal = new Modal({
                title: 'Suggested Tags',
                content,
                actions: [
                    { label: 'Cancel', className: 'btn btn-secondary', onClick: (m) => m.close() },
                    {
                        label: 'Add Selected',
                        className: 'btn btn-primary',
                        onClick: async (m) => {
                            const selected = Array.from(content.querySelectorAll('input:checked'))
                                .map(cb => cb.value);

                            if (selected.length > 0) {
                                if (!doc.tags) doc.tags = [];
                                for (const tag of selected) {
                                    if (!doc.tags.includes(tag)) {
                                        doc.tags.push(tag);
                                    }
                                }
                                if (this.options.onTagsChange) {
                                    await this.options.onTagsChange(doc, doc.tags);
                                }
                                this.render();
                            }
                            m.close();
                        }
                    }
                ]
            });
            modal.show();
        };

        // Scan for Library Links handler
        this.container.querySelector('#btn-scan-links').onclick = async () => {
            const btn = this.container.querySelector('#btn-scan-links');
            const container = this.container.querySelector('#library-links');

            btn.innerHTML = '<span class="spinner"></span> Scanning...';
            btn.disabled = true;

            try {
                // Yield to UI
                await new Promise(r => setTimeout(r, 50));

                const links = await scanDocumentForLinks(doc);

                if (links.length === 0) {
                    container.innerHTML = '<div class="text-muted">No Library references found.</div>';
                } else {
                    container.innerHTML = links.map(link => `
                        <div class="link-item">
                            <div class="link-icon">🔗</div>
                            <div class="link-info">
                                <div class="link-name">${Utils.escapeHtml(link.name)}</div>
                                <div class="link-meta">${link.count} mentions • ${link.type}</div>
                            </div>
                            <button class="btn btn-ghost btn-sm btn-view-link" data-id="${link.id}">View</button>
                        </div>
                    `).join('');

                    // Add view handlers
                    container.querySelectorAll('.btn-view-link').forEach(b => {
                        b.onclick = () => {
                            // Dispatch event to open Library/Project panel? 
                            // For now, just show a toast as we can't easily switch panels from here without more wiring.
                            // Ideally this would switch to the Library panel and select the item.
                            Toast.show(`Linked to: ${b.closest('.link-item').querySelector('.link-name').textContent}`, 'info');
                        };
                    });
                }
            } catch (err) {
                console.error(err);
                container.innerHTML = `<div class="text-error">Scan failed: ${err.message}</div>`;
            } finally {
                btn.innerHTML = '🔍 Scan';
                btn.disabled = false;
            }
        };

        // Ask Document handler
        this.container.querySelector('#btn-ask-doc').onclick = () => {
            // Chat UI Content
            const content = document.createElement('div');
            content.className = 'ask-doc-chat';
            content.innerHTML = `
                <div id="chat-history" class="chat-history">
                    <div class="chat-msg system">Ask questions about <strong>${Utils.escapeHtml(doc.filename)}</strong>.</div>
                </div>
                <div class="chat-input-area">
                    <textarea id="chat-input" class="input" placeholder="Ask a question..." rows="2"></textarea>
                    <button id="btn-send-chat" class="btn btn-primary">Send</button>
                </div>
             `;

            const modal = new Modal({
                title: 'Ask This Document',
                content,
                width: '600px',
                actions: [
                    { label: 'Close', className: 'btn btn-secondary', onClick: (m) => m.close() }
                ]
            });
            modal.show();

            const history = content.querySelector('#chat-history');
            const input = content.querySelector('#chat-input');
            const sendBtn = content.querySelector('#btn-send-chat');

            const appendMsg = (role, text) => {
                const div = document.createElement('div');
                div.className = `chat-msg ${role}`;
                div.innerText = text; // Safe text
                history.appendChild(div);
                history.scrollTop = history.scrollHeight;
            };

            const handleSend = async () => {
                const question = input.value.trim();
                if (!question) return;

                appendMsg('user', question);
                input.value = '';
                sendBtn.disabled = true;
                sendBtn.textContent = '...';

                try {
                    // Check LLM Config
                    const config = LLM.getActiveConfig();
                    if (!config) throw new Error('No AI model configured. Please set up a provider in Settings.');

                    // RAG: Embed and Search
                    const queryVector = await embedQuery(question);
                    const allChunks = flattenChunks([doc]); // Scope to this doc
                    const matches = findSimilar(queryVector, allChunks, 3);

                    let context = "";
                    if (matches.length > 0) {
                        context = matches.map(m => m.text).join('\n\n---\n\n');
                    }

                    const prompt = `You are a helpful assistant analyzing the document "${doc.filename}".
Use the following context from the document to answer the user's question. If the answer is not in the context, say so.

CONTEXT:
${context}

QUESTION:
${question}`;

                    appendMsg('assistant', 'Thinking...');
                    const loadingMsg = history.lastElementChild;

                    const response = await LLM.generate(prompt);
                    loadingMsg.innerText = response; // Replace loading

                } catch (err) {
                    console.error(err);
                    appendMsg('system', 'Error: ' + err.message);
                    if (history.lastElementChild.innerText === 'Thinking...') {
                        history.lastElementChild.remove();
                    }
                } finally {
                    sendBtn.disabled = false;
                    sendBtn.textContent = 'Send';
                    input.focus();
                }
            };

            sendBtn.onclick = handleSend;
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            };

            // Focus input
            setTimeout(() => input.focus(), 100);
        };

        // Remove tag handlers
        this.container.querySelectorAll('.tag-remove').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const tag = btn.dataset.tag;
                doc.tags = (doc.tags || []).filter(t => t !== tag);
                if (this.options.onTagsChange) {
                    await this.options.onTagsChange(doc, doc.tags);
                }
                this.render();
            };
        });
    }
}
