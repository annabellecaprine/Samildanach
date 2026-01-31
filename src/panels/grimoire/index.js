/**
 * Panel: Grimoire
 * Rules lorebook for game mechanics (Items, Spells, Abilities, etc.)
 */

import { RulesDB } from '../../core/rules-db.js';
import { getAllRuleCategories, getRuleCategoryById } from '../../core/rules-categories.js';
import { RichTextEditor } from '../../components/editor/index.js';
import { Modal } from '../../components/modal/index.js';
import { Toast } from '../../components/toast/index.js';

export const GrimoirePanel = {
    id: 'grimoire',
    label: 'Grimoire',
    icon: '📖',

    // Shared state across renders
    _state: {
        activeCategory: 'item',
        selectedRuleId: null,
        searchQuery: ''
    },

    render: async (container) => {
        await RulesDB.init();

        // Reload rules from DB each render
        let rules = await RulesDB.list();
        const categories = getAllRuleCategories();

        // Restore state
        let activeCategory = GrimoirePanel._state.activeCategory || categories[0]?.id || 'item';
        let selectedRuleId = GrimoirePanel._state.selectedRuleId;
        let selectedRule = selectedRuleId ? rules.find(r => r.id === selectedRuleId) : null;
        let searchQuery = GrimoirePanel._state.searchQuery || '';
        let editorInstance = null;

        async function renderPanel() {
            // Refresh from DB to ensure we have latest (in case of navigation)
            rules = await RulesDB.list();
            selectedRule = selectedRuleId ? rules.find(r => r.id === selectedRuleId) : null;

            // Filter by category AND search query
            const cat = getRuleCategoryById(activeCategory);
            let catRules = rules.filter(r => r.type === activeCategory);

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                catRules = catRules.filter(r =>
                    (r.data.name || '').toLowerCase().includes(q) ||
                    (r.data.description || '').toLowerCase().includes(q) ||
                    Object.values(r.data).some(v => typeof v === 'string' && v.toLowerCase().includes(q))
                );
            }

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

                        <!-- Search -->
                        <div style="padding: 0 8px 8px 8px;">
                            <input type="text" id="grimoire-search" class="input input-sm" 
                                   style="width: 100%;" 
                                   placeholder="Search ${cat?.label || 'rules'}..." 
                                   value="${searchQuery}">
                        </div>

                        <!-- Rule List -->
                        <div class="rule-list">
                            ${catRules.length === 0 ? `
                                <div class="empty-state">
                                    <div class="empty-icon">${searchQuery ? '🔍' : (cat?.icon || '📖')}</div>
                                    <div class="empty-text">${searchQuery ? 'No matches' : `No ${cat?.label || 'rules'} yet`}</div>
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
                    selectedRuleId = null;
                    selectedRule = null;
                    searchQuery = ''; // Clear search on category switch
                    GrimoirePanel._state.activeCategory = activeCategory;
                    GrimoirePanel._state.selectedRuleId = null;
                    GrimoirePanel._state.searchQuery = '';
                    renderPanel();
                };
            });

            // Bind search input
            const searchInput = container.querySelector('#grimoire-search');
            if (searchInput) {
                searchInput.oninput = (e) => {
                    searchQuery = e.target.value;
                    GrimoirePanel._state.searchQuery = searchQuery;

                    // Allow UI to update without losing focus
                    // Re-render only list part? For simplicity, we re-render full panel
                    // but we need to restore focus.
                    // Actually, re-rendering wipes the input, so we lose focus.
                    // Let's implement smart re-render or debounce.
                    // For now, debounce render and restore focus.

                    renderPanel().then(() => {
                        const newUrlInput = container.querySelector('#grimoire-search');
                        if (newUrlInput) {
                            newUrlInput.focus();
                            newUrlInput.setSelectionRange(newUrlInput.value.length, newUrlInput.value.length);
                        }
                    });
                };
            }

            // Bind rule list
            container.querySelectorAll('.rule-item').forEach(item => {
                item.onclick = () => {
                    selectedRuleId = item.dataset.id;
                    selectedRule = rules.find(r => r.id === selectedRuleId);
                    GrimoirePanel._state.selectedRuleId = selectedRuleId;
                    renderPanel();
                };
            });

            // Add button
            container.querySelector('#btn-add-rule')?.addEventListener('click', async () => {
                const newRule = await RulesDB.add(activeCategory, {
                    name: `New ${cat?.label || 'Rule'}`,
                    description: ''
                });
                console.log('[Grimoire] Created rule:', newRule.id);
                selectedRuleId = newRule.id;
                GrimoirePanel._state.selectedRuleId = selectedRuleId;

                // Clear search so we see the new item
                searchQuery = '';
                GrimoirePanel._state.searchQuery = '';

                renderPanel();
            });

            // Delete button
            container.querySelector('#btn-delete-rule')?.addEventListener('click', async () => {
                if (!selectedRule) return;
                const confirmed = await Modal.confirm('Delete Rule', `Delete "${selectedRule.data.name || 'this rule'}"?`);
                if (!confirmed) return;

                await RulesDB.delete(selectedRule.id);
                // console.log('[Grimoire] Deleted rule:', selectedRule.id);
                Toast.show('Rule deleted', 'success');
                selectedRuleId = null;
                selectedRule = null;
                GrimoirePanel._state.selectedRuleId = null;
                renderPanel();
            });

            // Save button
            container.querySelector('#btn-save-rule')?.addEventListener('click', async () => {
                if (!selectedRule) return;

                // Gather data from form
                const name = container.querySelector('#rule-name')?.value || '';
                const data = { name };

                container.querySelectorAll('.field-input').forEach(input => {
                    data[input.dataset.field] = input.value;
                });

                if (editorInstance) {
                    data.description = editorInstance.getValue();
                }

                // Update rule object
                selectedRule.data = data;
                await RulesDB.update(selectedRule);
                // console.log('[Grimoire] Saved rule:', selectedRule.id, data);
                Toast.show('Rule saved', 'success');

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

        await renderPanel();
    }
};
