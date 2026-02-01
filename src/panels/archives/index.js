/**
 * Panel: Archives
 * Knowledge Base for external lore documents.
 * Upload, process, and search documents with AI embeddings.
 */

import { ArchivesDB, DOC_STATUS } from '../../core/archives-db.js';
import { uploadDocument } from '../../core/archive-processor.js';
import { Utils } from '../../core/utils.js';
import { Toast } from '../../components/toast/index.js';
import { Modal } from '../../components/modal/index.js';
import { DocumentView } from './components/DocumentView.js';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const ArchivesPanel = {
    id: 'archives',
    label: 'Archives',
    icon: '🏛️',

    documents: [],
    collections: [],
    selectedDoc: null,
    selectedCollectionId: null,
    documentView: null,

    render: async (container, state) => {
        container.innerHTML = `<div class="loading-container"><div class="spinner spinner-lg"></div><div class="text-muted">Loading Archives...</div></div>`;

        try {
            await ArchivesDB.init();
        } catch (e) {
            container.innerHTML = `<div class="text-muted">Archives Error: ${e.message}</div>`;
            return;
        }

        ArchivesPanel.documents = await ArchivesDB.listDocuments();
        ArchivesPanel.collections = await ArchivesDB.listCollections();

        const collectionsOptions = ArchivesPanel.collections.map(c =>
            `<option value="${c.id}" ${ArchivesPanel.selectedCollectionId === c.id ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`
        ).join('');

        container.innerHTML = `
            <div class="archives-layout">
                <div class="archives-sidebar">
                    <div class="sidebar-header">
                        <h2 class="sidebar-title">📁 Documents</h2>
                        <button id="btn-upload" class="btn btn-primary btn-sm">+ Upload</button>
                    </div>
                    <div class="collection-filter">
                        <select id="collection-select" class="input input-sm">
                            <option value="">All Documents</option>
                            ${collectionsOptions}
                        </select>
                        <button id="btn-manage-collections" class="btn btn-ghost btn-sm" title="Manage Collections">⚙️</button>
                    </div>
                    <input type="file" id="file-input" accept=".txt,.md,.pdf,.docx" class="hidden" multiple>
                    <div id="documents-list" class="documents-list"></div>
                </div>
                <div id="archives-main" class="archives-main">
                    <div id="doc-view-area"></div>
                </div>
            </div>
        `;

        const docsList = container.querySelector('#documents-list');
        const docViewArea = container.querySelector('#doc-view-area');
        const fileInput = container.querySelector('#file-input');

        // Render document list (filtered by collection)
        ArchivesPanel.renderDocList(docsList);

        // Collection filter
        container.querySelector('#collection-select').onchange = (e) => {
            ArchivesPanel.selectedCollectionId = e.target.value || null;
            ArchivesPanel.renderDocList(docsList);
        };

        // Manage collections button
        container.querySelector('#btn-manage-collections').onclick = async () => {
            await ArchivesPanel.showCollectionsManager();
            // Refresh collections after managing
            ArchivesPanel.collections = await ArchivesDB.listCollections();
            const select = container.querySelector('#collection-select');
            select.innerHTML = `<option value="">All Documents</option>` +
                ArchivesPanel.collections.map(c =>
                    `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`
                ).join('');
        };

        // Init DocumentView with collection assignment
        ArchivesPanel.documentView = new DocumentView(docViewArea, {
            collections: ArchivesPanel.collections,
            onTagsChange: async (doc, tags) => {
                doc.tags = tags;
                await ArchivesDB.updateDocument(doc);
                Toast.show('Tags saved', 'success');
            },
            onCollectionChange: async (doc, collectionId) => {
                doc.collectionId = collectionId || null;
                await ArchivesDB.updateDocument(doc);
                ArchivesPanel.renderDocList(docsList);
                Toast.show('Collection updated', 'success');
            },
            onDelete: async (doc) => {
                await ArchivesDB.deleteDocument(doc.id);
                ArchivesPanel.documents = ArchivesPanel.documents.filter(d => d.id !== doc.id);
                ArchivesPanel.renderDocList(docsList);
                ArchivesPanel.documentView.showEmpty();
                Toast.show('Document deleted', 'info');
            }
        });
        ArchivesPanel.documentView.showEmpty();

        // Upload button
        container.querySelector('#btn-upload').onclick = () => fileInput.click();

        // File input handler
        fileInput.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            for (const file of files) {
                await ArchivesPanel.handleFileUpload(file, docsList);
            }
            fileInput.value = '';
        };

        // Dropzone
        const sidebar = container.querySelector('.archives-sidebar');
        sidebar.addEventListener('dragover', (e) => {
            e.preventDefault();
            sidebar.classList.add('dragover');
        });
        sidebar.addEventListener('dragleave', () => {
            sidebar.classList.remove('dragover');
        });
        sidebar.addEventListener('drop', async (e) => {
            e.preventDefault();
            sidebar.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            for (const file of files) {
                await ArchivesPanel.handleFileUpload(file, docsList);
            }
        });
    },

    async showCollectionsManager() {
        const collections = await ArchivesDB.listCollections();

        const content = document.createElement('div');
        content.innerHTML = `
            <div class="collections-manager">
                <div class="add-collection-row">
                    <input type="text" id="new-collection-name" class="input" placeholder="New collection name...">
                    <button id="btn-add-collection" class="btn btn-primary btn-sm">Add</button>
                </div>
                <div class="collections-list">
                    ${collections.length === 0 ? '<div class="text-muted">No collections yet</div>' : ''}
                    ${collections.map(c => `
                        <div class="collection-row" data-id="${c.id}">
                            <span class="collection-name">📂 ${Utils.escapeHtml(c.name)}</span>
                            <button class="btn btn-ghost btn-sm btn-delete-collection">🗑️</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        return new Promise((resolve) => {
            const modal = new Modal({
                title: 'Manage Collections',
                content,
                actions: [
                    { label: 'Done', className: 'btn btn-primary', onClick: (m) => { m.close(); resolve(); } }
                ]
            });

            // Add collection
            content.querySelector('#btn-add-collection').onclick = async () => {
                const input = content.querySelector('#new-collection-name');
                const name = input.value.trim();
                if (name) {
                    await ArchivesDB.addCollection(name);
                    Toast.show(`Collection "${name}" created`, 'success');
                    modal.close();
                    resolve();
                }
            };

            // Delete collection handlers
            content.querySelectorAll('.btn-delete-collection').forEach(btn => {
                btn.onclick = async () => {
                    const row = btn.closest('.collection-row');
                    const id = row.dataset.id;
                    const confirmed = await Modal.confirm('Delete Collection', 'Documents will be moved to uncategorized. Continue?');
                    if (confirmed) {
                        // Move documents in this collection to uncategorized
                        const docs = ArchivesPanel.documents.filter(d => d.collectionId === id);
                        for (const doc of docs) {
                            doc.collectionId = null;
                            await ArchivesDB.updateDocument(doc);
                        }
                        await ArchivesDB.deleteCollection(id);
                        Toast.show('Collection deleted', 'info');
                        modal.close();
                        resolve();
                    }
                };
            });

            modal.show();
        });
    },

    renderDocList(container) {
        // Filter by selected collection
        let filteredDocs = ArchivesPanel.documents;
        if (ArchivesPanel.selectedCollectionId) {
            filteredDocs = ArchivesPanel.documents.filter(d => d.collectionId === ArchivesPanel.selectedCollectionId);
        }

        if (filteredDocs.length === 0) {
            const emptyText = ArchivesPanel.selectedCollectionId
                ? 'No documents in this collection'
                : 'No documents yet';
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📄</div>
                    <div class="empty-text">${emptyText}</div>
                    <div class="empty-hint">Drag & drop or click Upload</div>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredDocs.map(doc => `
            <div class="doc-item ${doc.id === ArchivesPanel.selectedDoc?.id ? 'active' : ''}" data-id="${doc.id}">
                <div class="doc-icon">${ArchivesPanel.getStatusIcon(doc.status)}</div>
                <div class="doc-info">
                    <div class="doc-name">${Utils.escapeHtml(doc.filename)}</div>
                    <div class="doc-meta">${doc.chunks?.length || 0} chunks • ${ArchivesPanel.getStatusLabel(doc.status)}</div>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.doc-item').forEach(item => {
            item.onclick = async () => {
                const doc = ArchivesPanel.documents.find(d => d.id === item.dataset.id);
                if (doc) {
                    ArchivesPanel.selectedDoc = doc;
                    ArchivesPanel.renderDocList(container);
                    ArchivesPanel.documentView.setDocument(doc, ArchivesPanel.collections);
                }
            };
        });
    },

    getStatusIcon(status) {
        switch (status) {
            case DOC_STATUS.PENDING: return '⏳';
            case DOC_STATUS.PROCESSING: return '⚙️';
            case DOC_STATUS.READY: return '✅';
            case DOC_STATUS.ERROR: return '❌';
            default: return '📄';
        }
    },

    getStatusLabel(status) {
        switch (status) {
            case DOC_STATUS.PENDING: return 'Pending';
            case DOC_STATUS.PROCESSING: return 'Processing...';
            case DOC_STATUS.READY: return 'Ready';
            case DOC_STATUS.ERROR: return 'Error';
            default: return 'Unknown';
        }
    },

    async handleFileUpload(file, docsList) {
        const ext = file.name.split('.').pop().toLowerCase();
        let rawText = '';

        try {
            Toast.show(`Reading ${file.name}...`, 'info');

            if (ext === 'txt' || ext === 'md') {
                rawText = await file.text();
            } else if (ext === 'pdf') {
                rawText = await ArchivesPanel.extractPdfText(file);
            } else if (ext === 'docx') {
                rawText = await ArchivesPanel.extractDocxText(file);
            } else {
                Toast.show(`Unsupported format: ${ext}`, 'error');
                return;
            }

            if (!rawText.trim()) {
                Toast.show('No text content found in file', 'error');
                return;
            }

            const doc = await uploadDocument(file.name, rawText);
            ArchivesPanel.documents.push(doc);
            ArchivesPanel.renderDocList(docsList);

        } catch (err) {
            console.error('[Archives] Upload error:', err);
            Toast.show(`Failed to read ${file.name}`, 'error');
        }
    },

    async extractPdfText(file) {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n\n';
        }

        return text;
    },

    async extractDocxText(file) {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        return result.value;
    }
};
