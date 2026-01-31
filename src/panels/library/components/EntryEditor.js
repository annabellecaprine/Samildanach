/**
 * Component: Entry Editor
 * Form for editing a single entry's metadata and description.
 * @module Library/Components/EntryEditor
 */

import { getCategoryById } from '../../../core/categories.js';
import { RichTextEditor } from '../../../components/editor/index.js';

export class EntryEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.item = null;
        this.onSave = options.onSave || null;
        this.onNameChange = options.onNameChange || null;
        this.onLinkClick = options.onLinkClick || null;
        this.getEntries = options.getEntries || (() => []);
        this.editorInstance = null;
    }

    setItem(item) {
        this.item = item;
        if (item) {
            this.render();
        } else {
            this.showEmpty();
        }
    }

    showEmpty() {
        this.container.innerHTML = `
            <div class="empty-state">
                <h2>Select an entry</h2>
                <p>Or create a new one to start building your world.</p>
            </div>
        `;
    }

    render() {
        if (!this.item) return this.showEmpty();

        const cat = getCategoryById(this.item.type);

        this.container.innerHTML = `
            <div class="library-editor active">
                <div class="entry-header">
                    <span id="entry-icon" class="entry-icon">${cat.icon}</span>
                    <input id="asset-title" type="text" placeholder="Entry Name" 
                        value="${this.item.data.name || ''}" class="input-title entry-title">
                    <span id="entry-category-badge" class="badge" 
                        style="background:${cat.color}; color:#fff;">${cat.label}</span>
                </div>
                
                <div id="metadata-fields" class="metadata-grid"></div>
                
                <div class="description-label">Description</div>
                <div id="asset-rte-mount" class="description-editor"></div>
                
                <div id="save-status" class="save-status">Saved</div>
            </div>
        `;

        const titleInput = this.container.querySelector('#asset-title');
        const metadataFields = this.container.querySelector('#metadata-fields');
        const rteMount = this.container.querySelector('#asset-rte-mount');
        const saveStatus = this.container.querySelector('#save-status');

        // Metadata fields
        cat.fields.forEach(field => {
            const wrapper = document.createElement('div');
            wrapper.className = 'metadata-field';

            const label = document.createElement('label');
            label.innerText = field.label;
            label.className = 'label';

            let input;
            if (field.type === 'textarea') {
                input = document.createElement('textarea');
                input.rows = 2;
                input.className = 'textarea';
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'input';
            }
            input.value = this.item.data[field.key] || '';
            input.oninput = () => {
                this.item.data[field.key] = input.value;
                this.save();
            };

            wrapper.appendChild(label);
            wrapper.appendChild(input);
            metadataFields.appendChild(wrapper);
        });

        // Rich text editor
        const editor = new RichTextEditor(rteMount, this.item.data.description || '', {
            getEntries: this.getEntries,
            onLinkClick: this.onLinkClick
        });
        editor.render();
        this.editorInstance = editor;
        editor.onChange = (html) => {
            this.item.data.description = html;
            this.save();
        };

        // Title
        let renameTimeout = null;
        titleInput.oninput = () => {
            this.item.data.name = titleInput.value;
            this.save();
            clearTimeout(renameTimeout);
            renameTimeout = setTimeout(() => {
                if (this.onNameChange) this.onNameChange(this.item);
            }, 300);
        };
    }

    async save() {
        const saveStatus = this.container.querySelector('#save-status');
        if (saveStatus) saveStatus.innerText = 'Saving...';

        if (this.onSave) {
            await this.onSave(this.item);
        }

        if (saveStatus) saveStatus.innerText = 'Saved';
    }
}
