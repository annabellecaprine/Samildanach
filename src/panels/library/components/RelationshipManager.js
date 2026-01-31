/**
 * Component: Relationship Manager
 * Manages relationships for an entry (outgoing + back-references).
 * @module Library/Components/RelationshipManager
 */

import { getCategoryById } from '../../../core/categories.js';
import { Utils } from '../../../core/utils.js';
import { getRelationshipById, getAllRelationshipTypes, RELATIONSHIP_TYPES } from '../../../core/relationships.js';
import { Modal } from '../../../components/modal/index.js';

export class RelationshipManager {
    constructor(container, options = {}) {
        this.container = container;
        this.item = null;
        this.allItems = [];
        this.onSave = options.onSave || null;
        this.onNavigate = options.onNavigate || null;
    }

    setItem(item, allItems) {
        this.item = item;
        this.allItems = allItems;
        if (item) {
            this.render();
        }
    }

    render() {
        if (!this.item) return;

        // Ensure relationships array exists
        if (!this.item.data.relationships) {
            this.item.data.relationships = [];
        }

        this.container.innerHTML = `
            <div class="relationships-header">
                <div class="label">Relationships</div>
                <button id="add-relationship-btn" class="btn btn-primary btn-sm">+ Add</button>
            </div>
            <div id="relationships-list" class="relationships-list"></div>
            <div id="back-references" class="back-references"></div>
        `;

        this.renderRelationships();

        this.container.querySelector('#add-relationship-btn').onclick = () => this.showAddModal();
    }

    renderRelationships() {
        const listEl = this.container.querySelector('#relationships-list');
        const backRefsEl = this.container.querySelector('#back-references');

        // Outgoing relationships
        listEl.innerHTML = '';
        if (this.item.data.relationships.length === 0) {
            listEl.innerHTML = '<div class="text-muted text-sm">No relationships defined.</div>';
        } else {
            this.item.data.relationships.forEach((rel, idx) => {
                const relType = getRelationshipById(rel.type);
                const target = this.allItems.find(i => i.id === rel.targetId);
                const targetName = target ? (target.data.name || 'Untitled') : '(Deleted)';
                const targetCat = target ? getCategoryById(target.type) : { icon: '❓' };

                const row = document.createElement('div');
                row.className = 'relationship-row';
                row.innerHTML = `
                    <span>${relType.icon}</span>
                    <span class="relationship-type">${relType.label}</span>
                    <span class="relationship-target" data-id="${rel.targetId}">${targetCat.icon} ${targetName}</span>
                    <button class="relationship-delete" data-idx="${idx}">×</button>
                `;
                listEl.appendChild(row);
            });

            // Click handlers
            listEl.querySelectorAll('.relationship-target').forEach(el => {
                el.onclick = () => {
                    const target = this.allItems.find(i => i.id === el.dataset.id);
                    if (target && this.onNavigate) this.onNavigate(target);
                };
            });

            listEl.querySelectorAll('.relationship-delete').forEach(el => {
                el.onclick = () => {
                    this.item.data.relationships.splice(parseInt(el.dataset.idx), 1);
                    if (this.onSave) this.onSave(this.item);
                    this.renderRelationships();
                };
            });
        }

        // Back-references
        const backRefs = this.allItems.filter(other =>
            other.id !== this.item.id &&
            other.data.relationships?.some(r => r.targetId === this.item.id)
        );

        backRefsEl.innerHTML = '';
        if (backRefs.length === 0) {
            backRefsEl.innerHTML = '<div class="text-muted text-xs">No incoming references.</div>';
        } else {
            backRefsEl.innerHTML = '<div class="back-ref-label">Referenced by:</div>';
            backRefs.forEach(other => {
                const otherCat = getCategoryById(other.type);
                const rels = other.data.relationships.filter(r => r.targetId === this.item.id);
                rels.forEach(rel => {
                    const relType = getRelationshipById(rel.type);
                    const inverseType = RELATIONSHIP_TYPES[relType.inverse];
                    const row = document.createElement('div');
                    row.className = 'back-ref-item';
                    row.innerHTML = `<span>${otherCat.icon}</span> ${Utils.escapeHtml(other.data.name || 'Untitled')} <span class="text-muted">(${inverseType?.label || relType.label})</span>`;
                    row.onclick = () => { if (this.onNavigate) this.onNavigate(other); };
                    backRefsEl.appendChild(row);
                });
            });
        }
    }

    showAddModal() {
        const content = document.createElement('div');
        content.className = 'flex flex-col gap-md';
        content.innerHTML = `
            <div>
                <label class="label">Type</label>
                <select id="rel-type-select" class="input w-full mt-sm"></select>
            </div>
            <div>
                <label class="label">Target Entry</label>
                <select id="rel-target-select" class="input w-full mt-sm"></select>
            </div>
        `;

        const modal = new Modal({
            title: 'Add Relationship',
            content,
            actions: [
                { label: 'Cancel', className: 'btn btn-secondary', onClick: (m) => m.close() },
                {
                    label: 'Add', className: 'btn btn-primary', onClick: (m) => {
                        const typeSelect = content.querySelector('#rel-type-select');
                        const targetSelect = content.querySelector('#rel-target-select');
                        const type = typeSelect.value;
                        const targetId = targetSelect.value;
                        if (type && targetId) {
                            this.item.data.relationships.push({ type, targetId });
                            if (this.onSave) this.onSave(this.item);
                            this.renderRelationships();
                        }
                        m.close();
                    }
                }
            ]
        });
        modal.show();

        // Populate dropdowns
        const typeSelect = content.querySelector('#rel-type-select');
        const targetSelect = content.querySelector('#rel-target-select');

        getAllRelationshipTypes().forEach(rt => {
            const opt = document.createElement('option');
            opt.value = rt.id;
            opt.innerText = `${rt.icon} ${rt.label}`;
            typeSelect.appendChild(opt);
        });

        this.allItems.filter(i => i.id !== this.item.id).forEach(other => {
            const otherCat = getCategoryById(other.type);
            const opt = document.createElement('option');
            opt.value = other.id;
            opt.innerText = `${otherCat.icon} ${other.data.name || 'Untitled'}`;
            targetSelect.appendChild(opt);
        });
    }
}
