/**
 * Component: DocumentView
 * Detail view for a selected Archive document.
 * Shows metadata, tags, and chunk preview.
 */

import { Utils } from '../../../core/utils.js';
import { Modal } from '../../../components/modal/index.js';
import { suggestTags } from '../../../core/auto-tagger.js';

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

    setDocument(doc) {
        this.document = doc;
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

        this.container.innerHTML = `
            <div class="doc-view">
                <div class="doc-view-header">
                    <h2 class="doc-title">${Utils.escapeHtml(doc.filename)}</h2>
                    <button id="btn-delete-doc" class="btn btn-ghost btn-sm">🗑️ Delete</button>
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
                        <div class="meta-label">Model</div>
                        <div class="meta-value">${doc.modelVersion || 'N/A'}</div>
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
            if (!text) {
                return;
            }

            const suggestions = suggestTags(text, doc.tags || [], 5);
            if (suggestions.length === 0) {
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
