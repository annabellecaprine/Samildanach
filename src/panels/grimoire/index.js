/**
 * Panel: Grimoire
 * Rules lorebook for game mechanics (Items, Spells, Abilities, etc.)
 */

import { RulesDB } from '../../core/rules-db.js';
import { getAllRuleCategories, getRuleCategoryById } from '../../core/rules-categories.js';
import { RichTextEditor } from '../../components/editor/index.js';

export const GrimoirePanel = {
    id: 'grimoire',
    label: 'Grimoire',
    icon: '📖',

    render: async (container) => {
        await RulesDB.init();
        const rules = await RulesDB.list();
        const categories = getAllRuleCategories();

        let activeCategory = categories[0]?.id || 'item';
        let selectedRule = null;
        let editorInstance = null;

        function renderPanel() {
            const catRules = rules.filter(r => r.type === activeCategory);
            const cat = getRuleCategoryById(activeCategory);

            container.innerHTML = `
                <div class="grimoire-layout">
                    <!-- Left: Categories + List -->
                    <div class="grimoire-sidebar">
                        <div class="sidebar-header">
                            <strong>📖 Grimoire</strong>
                        </div>

                        <!-- Category Tabs -->
                        <div class="category-tabs">
                            ${categories.map(c => `
                                <button class="cat-tab ${c.id === activeCategory ? 'active' : ''}" 
                                        data-cat="${c.id}" 
                                        style="--cat-color: ${c.color}"
                                        title="${c.description}">
                                    ${c.icon}
                                </button>
                            `).join('')}
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${catRules.length === 0 ? `
                                <div class="empty-state">
                                    <div class="empty-icon">${cat?.icon || '📖'}</div>
                                    <div class="empty-text">No ${cat?.label || 'rules'} yet</div>
                                </div>
                            ` : catRules.map(r => `
                                <div class="rule-item ${selectedRule?.id === r.id ? 'selected' : ''}" data-id="${r.id}">
                                    <div class="rule-icon" style="color: ${cat?.color}">${cat?.icon}</div>
                                    <div class="rule-info">
                                        <div class="rule-name">${r.data.name || 'Untitled'}</div>
                                        <div class="rule-meta">${r.data.type || r.data.level || ''}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <div class="sidebar-footer">
                            <button id="btn-add-rule" class="btn btn-primary btn-sm">+ Add ${cat?.label || 'Rule'}</button>
                        </div>
                    </div>

                    <!-- Right: Editor -->
                    <div class="grimoire-main">
                        ${!selectedRule ? `
                            <div class="editor-empty">
                                <div class="empty-icon">📖</div>
                                <div class="empty-text">Select or create a ${cat?.label || 'rule'}</div>
                            </div>
                        ` : `
                            <div class="rule-editor">
                                <div class="editor-header">
                                    <input type="text" id="rule-name" class="input input-lg" 
                                           value="${selectedRule.data.name || ''}" 
                                           placeholder="${cat?.label || 'Rule'} Name">
                                    <button id="btn-delete-rule" class="btn btn-ghost btn-sm" title="Delete">🗑️</button>
                                </div>

                                <div class="editor-fields">
                                    ${(cat?.fields || []).map(f => `
                                        <div class="field-group">
                                            <label class="field-label">${f.label}</label>
                                            <input type="text" 
                                                   class="input field-input" 
                                                   data-field="${f.key}"
                                                   value="${selectedRule.data[f.key] || ''}"
                                                   placeholder="${f.placeholder || ''}">
                                        </div>
                                    `).join('')}
                                </div>

                                <div class="editor-description">
                                    <label class="field-label">Description</label>
                                    <div id="description-editor"></div>
                                </div>

                                <div class="editor-footer">
                                    <button id="btn-save-rule" class="btn btn-primary">Save</button>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            `;

            // Bind category tabs
            container.querySelectorAll('.cat-tab').forEach(tab => {
                tab.onclick = () => {
                    activeCategory = tab.dataset.cat;
                    selectedRule = null;
                    renderPanel();
                };
            });

            // Bind rule list
            container.querySelectorAll('.rule-item').forEach(item => {
                item.onclick = () => {
                    const id = item.dataset.id;
                    selectedRule = rules.find(r => r.id === id);
                    renderPanel();
                };
            });

            // Add button
            container.querySelector('#btn-add-rule')?.addEventListener('click', async () => {
                const newRule = await RulesDB.add(activeCategory, {
                    name: `New ${cat?.label || 'Rule'}`,
                    description: ''
                });
                rules.push(newRule);
                selectedRule = newRule;
                renderPanel();
            });

            // Delete button
            container.querySelector('#btn-delete-rule')?.addEventListener('click', async () => {
                if (!selectedRule) return;
                if (!confirm(`Delete "${selectedRule.data.name || 'this rule'}"?`)) return;

                await RulesDB.delete(selectedRule.id);
                const idx = rules.findIndex(r => r.id === selectedRule.id);
                if (idx >= 0) rules.splice(idx, 1);
                selectedRule = null;
                renderPanel();
            });

            // Save button
            container.querySelector('#btn-save-rule')?.addEventListener('click', async () => {
                if (!selectedRule) return;

                // Gather data
                const name = container.querySelector('#rule-name')?.value || '';
                const data = { name };

                container.querySelectorAll('.field-input').forEach(input => {
                    data[input.dataset.field] = input.value;
                });

                if (editorInstance) {
                    data.description = editorInstance.getValue();
                }

                selectedRule.data = data;
                await RulesDB.update(selectedRule);

                // Update local cache
                const idx = rules.findIndex(r => r.id === selectedRule.id);
                if (idx >= 0) rules[idx] = selectedRule;

                renderPanel();
            });

            // Initialize rich editor
            if (selectedRule) {
                const editorContainer = container.querySelector('#description-editor');
                if (editorContainer) {
                    editorInstance = new RichTextEditor(
                        editorContainer,
                        selectedRule.data.description || ''
                    );
                    editorInstance.render();
                }
            }
        }

        renderPanel();
    }
};
