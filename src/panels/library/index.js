/**
 * Panel: Library
 * World-Building Database with Taxonomy Support.
 * Orchestrates sub-components: EntryList, EntryEditor, RelationshipManager.
 */

import { VaultDB } from '../../core/vault.js';
import { State } from '../../core/state.js';
import { getAllCategories, getCategoryById } from '../../core/categories.js';
import { Modal } from '../../components/modal/index.js';
import { EntryList } from './components/EntryList.js';
import { EntryEditor } from './components/EntryEditor.js';
import { RelationshipManager } from './components/RelationshipManager.js';

export const LibraryPanel = {
    id: 'library',
    label: 'Library',
    icon: '📚',

    // Component instances
    entryList: null,
    entryEditor: null,
    relationshipManager: null,
    allItems: [],
    activeItem: null,

    render: async (container, state) => {
        try {
            await VaultDB.init();
        } catch (e) {
            container.innerHTML = `<div class="text-muted">Vault Error: ${e.message}</div>`;
            return;
        }

        container.innerHTML = `
            <div class="library-layout">
                <div id="lib-sidebar" class="library-sidebar"></div>
                <div id="lib-main" class="library-main">
                    <div id="lib-editor-area"></div>
                    <div id="lib-relationships-area" class="relationships-section" style="display:none;"></div>
                </div>
            </div>
        `;

        const sidebarEl = container.querySelector('#lib-sidebar');
        const editorEl = container.querySelector('#lib-editor-area');
        const relationshipsEl = container.querySelector('#lib-relationships-area');

        // Load items
        LibraryPanel.allItems = await VaultDB.list();

        // Create components
        LibraryPanel.entryList = new EntryList(sidebarEl, {
            onSelect: (item) => LibraryPanel.selectItem(item, editorEl, relationshipsEl),
            onCreate: () => LibraryPanel.showCreateModal()
        });
        LibraryPanel.entryList.setItems(LibraryPanel.allItems);

        LibraryPanel.entryEditor = new EntryEditor(editorEl, {
            onSave: async (item) => {
                await VaultDB.updateItem(item);
            },
            onNameChange: (item) => {
                LibraryPanel.entryList.setItems(LibraryPanel.allItems);
            },
            onLinkClick: (name) => {
                const target = LibraryPanel.allItems.find(i =>
                    (i.data.name || '').toLowerCase() === name.toLowerCase()
                );
                if (target) LibraryPanel.selectItem(target, editorEl, relationshipsEl);
            },
            getEntries: () => LibraryPanel.allItems
        });
        LibraryPanel.entryEditor.showEmpty();

        LibraryPanel.relationshipManager = new RelationshipManager(relationshipsEl, {
            onSave: async (item) => {
                await VaultDB.updateItem(item);
            },
            onNavigate: (target) => {
                LibraryPanel.selectItem(target, editorEl, relationshipsEl);
            }
        });

        // Restore last active entry from State
        if (State.session.activeEntryId) {
            const lastItem = LibraryPanel.allItems.find(i => i.id === State.session.activeEntryId);
            if (lastItem) {
                LibraryPanel.selectItem(lastItem, editorEl, relationshipsEl);
            }
        }
    },

    selectItem(item, editorEl, relationshipsEl) {
        LibraryPanel.activeItem = item;
        LibraryPanel.entryList.setActiveItem(item.id);
        LibraryPanel.entryEditor.setItem(item);

        relationshipsEl.style.display = 'block';
        LibraryPanel.relationshipManager.setItem(item, LibraryPanel.allItems);

        // Save to State
        State.updateSession({ activeEntryId: item.id });
    },

    showCreateModal() {
        const content = document.createElement('div');
        content.className = 'grid-3';

        getAllCategories().forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.style.cssText = 'flex-direction:column; padding:12px;';
            btn.innerHTML = `<span style="font-size:20px;">${cat.icon}</span><span class="text-xs">${cat.label}</span>`;
            btn.onclick = async () => {
                modal.close();
                const newItem = await VaultDB.addItem(cat.id, { name: `New ${cat.label}`, description: '' });
                LibraryPanel.allItems.push(newItem);
                LibraryPanel.entryList.setItems(LibraryPanel.allItems);

                // Find the editor and relationships elements
                const editorEl = document.querySelector('#lib-editor-area');
                const relationshipsEl = document.querySelector('#lib-relationships-area');
                LibraryPanel.selectItem(newItem, editorEl, relationshipsEl);
            };
            content.appendChild(btn);
        });

        const modal = new Modal({
            title: 'Create New Entry',
            content,
            actions: [
                { label: 'Cancel', className: 'btn btn-secondary', onClick: (m) => m.close() }
            ]
        });
        modal.show();
    }
};
