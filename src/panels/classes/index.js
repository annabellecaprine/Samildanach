/**
 * Panel: Class Builder
 * Interface for creating and editing RPG classes.
 * @module Panels/Classes
 */

import { ClassesDB } from '../../core/classes-db.js';
import { RulesDB } from '../../core/rules-db.js';
import { Utils } from '../../core/utils.js';
import { Modal } from '../../components/modal/index.js';
import { Toast } from '../../components/toast/index.js';
import { ResourcePicker } from '../../components/resource-picker/index.js';

export const ClassesPanel = {
    id: 'classes',
    icon: '🛡️',
    title: 'Class Builder',

    // Panel state
    activeClassId: null,
    classes: [],

    render: async function (container) {
        if (!container) {
            console.error('[ClassesPanel] Container is null!');
            return;
        }
        this.container = container;
        try {
            this.renderLayout();
            await this.refreshList();
        } catch (e) {
            console.error('[ClassesPanel] Error during render:', e);
            this.container.innerHTML = `<div class="text-error p-4">Error loading panel: ${e.message}</div>`;
        }
    },

    renderLayout: function () {
        this.container.innerHTML = `
            <div class="classes-layout">
                <div class="sidebar">
                    <div class="sidebar-header">
                        <h3 class="sidebar-title">Classes</h3>
                        <div class="sidebar-actions">
                            <button id="btn-new-class" class="btn btn-primary btn-sm">+ New</button>
                        </div>
                    </div>
                    <div id="classes-list" class="classes-list">
                        <!-- Class items go here -->
                        <div class="loading-spinner"></div>
                    </div>
                </div>
                <div class="main-content">
                    <div id="class-editor" class="class-editor">
                        <div class="empty-state">
                            <div class="empty-icon">🛡️</div>
                            <div class="empty-text">Select a class to edit</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind New Class button
        this.container.querySelector('#btn-new-class').onclick = () => this.createNewClass();
    },

    refreshList: async function () {
        try {
            this.classes = await ClassesDB.list();
            this.renderList();
        } catch (err) {
            console.error('Failed to load classes:', err);
            Toast.show('Error loading classes', 'error');
        }
    },

    renderList: function () {
        const listContainer = this.container.querySelector('#classes-list');

        if (this.classes.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-list">
                    No classes yet.
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.classes.map(cls => `
            <div class="class-item ${cls.id === this.activeClassId ? 'active' : ''}" data-id="${cls.id}">
                <div class="class-item-icon">🛡️</div>
                <div class="class-item-info">
                    <div class="class-name">${Utils.escapeHtml(cls.name)}</div>
                    <div class="class-meta">${cls.hitDie || 'd8'} • ${cls.progression?.length || 0} levels</div>
                </div>
            </div>
        `).join('');

        // Bind clicks
        listContainer.querySelectorAll('.class-item').forEach(item => {
            item.onclick = () => this.selectClass(item.dataset.id);
        });
    },

    createNewClass: async function () {
        const name = await Modal.prompt('New Class', 'Enter class name:');
        if (!name) return;

        try {
            const newClass = await ClassesDB.add({ name });
            this.classes.push(newClass);
            await this.refreshList();
            this.selectClass(newClass.id);
            Toast.show('Class created', 'success');
        } catch (err) {
            console.error(err);
            Toast.show('Failed to create class', 'error');
        }
    },

    selectClass: async function (id) {
        this.activeClassId = id;
        this.renderList(); // Update active state

        const cls = this.classes.find(c => c.id === id);
        if (cls) {
            this.renderEditor(cls);
        }
    },

    renderEditor: async function (cls) {
        const editorContainer = this.container.querySelector('#class-editor');
        editorContainer.innerHTML = `
            <div class="editor-header">
                <div class="header-main">
                    <input type="text" id="class-name-input" class="class-name-input" value="${Utils.escapeHtml(cls.name)}" placeholder="Class Name">
                </div>
                <div class="header-actions">
                    <button id="btn-delete-class" class="btn btn-ghost btn-danger btn-sm">Delete</button>
                    <button id="btn-save-class" class="btn btn-primary btn-sm">Save</button>
                </div>
            </div>

            <div class="editor-body">
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="class-desc-input" class="input" rows="3">${Utils.escapeHtml(cls.description || '')}</textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Hit Die</label>
                        <input type="text" id="class-hit-die" class="input" value="${Utils.escapeHtml(cls.hitDie || 'd8')}" placeholder="e.g. d8, 10 HP">
                    </div>
                    <div class="form-group">
                        <label>Primary Ability</label>
                        <input type="text" id="class-ability" class="input" value="${Utils.escapeHtml(cls.primaryAbility || '')}" placeholder="e.g. Strength">
                    </div>
                </div>

                <div class="progression-section">
                    <h3>Progression</h3>
                    <div class="table-container">
                        <table class="progression-table">
                            <thead>
                                <tr>
                                    <th width="60">Level</th>
                                    <th>Features</th>
                                    <th width="80">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="progression-tbody">
                                <tr><td colspan="3" class="text-center p-4 text-muted">Loading progression...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Bind basic events (Save/Delete)
        editorContainer.querySelector('#btn-save-class').onclick = () => this.saveClass();
        editorContainer.querySelector('#btn-delete-class').onclick = () => this.deleteClass(cls);

        // --- Render Progression Rows with Data ---
        const tbody = editorContainer.querySelector('#progression-tbody');
        const progression = cls.progression || [];

        // 1. Collect all Rule IDs to fetch
        const allRuleIds = new Set();
        progression.forEach(p => {
            if (p.features) p.features.forEach(id => allRuleIds.add(id));
        });

        // 2. Batch fetch names
        const namesMap = new Map();
        if (allRuleIds.size > 0) {
            await Promise.all(Array.from(allRuleIds).map(async (id) => {
                try {
                    const rule = await RulesDB.get(id);
                    namesMap.set(id, rule ? rule.data.name : id);
                } catch (e) {
                    namesMap.set(id, id);
                }
            }));
        }

        // 3. Generate HTML
        let rowsHtml = '';
        for (let level = 1; level <= 20; level++) {
            const levelData = progression.find(p => p.level === level) || { features: [], customFeatures: [] };

            // Build list of names
            const featureNames = [];
            if (levelData.features) {
                levelData.features.forEach(id => featureNames.push(namesMap.get(id) || id));
            }
            if (levelData.customFeatures) {
                levelData.customFeatures.forEach(cf => featureNames.push(cf.name));
            }

            const featuresDisplay = featureNames.length > 0
                ? featureNames.map(n => `<span class="badge feature-badge">${Utils.escapeHtml(n)}</span>`).join(' ')
                : '<span class="text-muted text-sm">-</span>';

            rowsHtml += `
                <tr class="level-row" data-level="${level}">
                    <td class="level-cell">${level}</td>
                    <td class="features-cell">
                        <div class="features-wrapper">
                            ${featuresDisplay}
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-ghost btn-sm btn-edit-level" data-level="${level}">Edit</button>
                    </td>
                </tr>
             `;
        }
        tbody.innerHTML = rowsHtml;

        // Bind Edit buttons
        editorContainer.querySelectorAll('.btn-edit-level').forEach(btn => {
            btn.onclick = () => this.editLevel(cls, parseInt(btn.dataset.level));
        });
    },

    editLevel: async function (cls, level) {
        // This would ideally be a more complex modal showing current features + Add button
        // For MVP, just open the picker to ADD features, and maybe a list to remove?
        // Let's open a modal that LISTS current features (with remove buttons) and has an ADD button.

        const progression = cls.progression || [];
        let levelData = progression.find(p => p.level === level);
        if (!levelData) {
            levelData = { level, features: [], customFeatures: [] };
            // Do not push yet, wait for save? Or modify object reference?
            // Safest to work on a copy or modify directly if we save later.
            // We'll modify `cls` in memory and let user click Save Class.
            if (!cls.progression) cls.progression = [];
            cls.progression.push(levelData);
        }

        const renderContent = async () => {
            // Fetch rule details for names
            const featureDetails = await Promise.all(levelData.features.map(async (id) => {
                try {
                    const rule = await RulesDB.get(id);
                    return { id, name: rule ? rule.data.name : id };
                } catch (e) {
                    return { id, name: id };
                }
            }));

            // Let's create a content div
            const div = document.createElement('div');
            div.innerHTML = `
                <div class="level-editor">
                    <p class="text-sm text-muted mb-2">Assign features from the Grimoire to Level ${level}.</p>
                    <div class="features-list">
                        ${levelData.features.length === 0 ? '<div class="text-muted p-2">No features assigned.</div>' : ''}
                        ${featureDetails.map(f => `
                            <div class="feature-chip">
                                <span>${Utils.escapeHtml(f.name)}</span> 
                                <button class="btn-icon btn-remove-feature" data-id="${f.id}" title="Remove">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="modal-actions-bar" style="margin-top: 16px;">
                        <button id="btn-add-feature" class="btn btn-secondary btn-sm">+ Add Rule</button>
                    </div>
                </div>
             `;

            // Bind Remove
            div.querySelectorAll('.btn-remove-feature').forEach(b => {
                b.onclick = () => {
                    levelData.features = levelData.features.filter(f => f !== b.dataset.id);
                    updateModal(); // re-render
                };
            });

            // Bind Add
            div.querySelector('#btn-add-feature').onclick = () => {
                ResourcePicker.pickRule({
                    title: `Add Feature to Level ${level}`,
                    multiple: true,
                    onSelect: (rules) => {
                        const ids = rules.map(r => r.id);
                        // Add unique
                        ids.forEach(id => {
                            if (!levelData.features.includes(id)) levelData.features.push(id);
                        });
                        updateModal();
                    }
                });
            };

            return div;
        };

        const modalContent = await renderContent(); // Initial render

        const modal = new Modal({
            title: `Edit Level ${level}`,
            content: modalContent,
            actions: [
                {
                    label: 'Done', className: 'btn btn-primary', onClick: async (m) => {
                        await this.saveClass(); // Persist changes
                        this.renderEditor(cls); // Refresh main view
                        m.close();
                    }
                }
            ]
        });

        // Helper to re-render content
        const updateModal = async () => {
            const newContent = await renderContent();
            modal.setContent(newContent);
        };

        modal.show();
    },

    saveClass: async function () {
        if (!this.activeClassId) return;

        const container = this.container.querySelector('#class-editor');
        const name = container.querySelector('#class-name-input').value;
        const description = container.querySelector('#class-desc-input').value;
        const hitDie = container.querySelector('#class-hit-die').value;
        const primaryAbility = container.querySelector('#class-ability').value;

        const cls = this.classes.find(c => c.id === this.activeClassId);
        if (!cls) return;

        const updated = {
            ...cls,
            name,
            description,
            hitDie,
            primaryAbility
        };

        try {
            await ClassesDB.update(updated);
            // Update local state
            const index = this.classes.findIndex(c => c.id === this.activeClassId);
            if (index !== -1) this.classes[index] = updated;

            Toast.show('Class saved', 'success');
            this.refreshList(); // Update sidebar name
        } catch (err) {
            console.error(err);
            Toast.show('Failed to save class', 'error');
        }
    },

    deleteClass: async function (cls) {
        const confirmed = await Modal.confirm('Delete Class', `Are you sure you want to delete "${cls.name}"?`);
        if (!confirmed) return;

        try {
            await ClassesDB.delete(cls.id);
            this.classes = this.classes.filter(c => c.id !== cls.id);
            this.activeClassId = null;
            this.renderList();
            this.container.querySelector('#class-editor').innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🛡️</div>
                    <div class="empty-text">Select a class to edit</div>
                </div>
            `;
            Toast.show('Class deleted', 'success');
        } catch (err) {
            console.error(err);
            Toast.show('Failed to delete class', 'error');
        }
    }
};
