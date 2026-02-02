/**
 * Component: Resource Picker
 * Modal functionality to select items from a database (Rules, Vault).
 * @module Components/ResourcePicker
 */

import { RulesDB } from '../../core/rules-db.js';
import { Utils } from '../../core/utils.js';
import { Modal } from '../modal/index.js';

export const ResourcePicker = {
    /**
     * Open a picker modal for Grimoire Rules
     * @param {Object} options
     * @param {string} options.title - Modal title
     * @param {Function} options.onSelect - Callback(selectedItems[])
     * @param {boolean} options.multiple - Allow multiple selection
     */
    pickRule: async function (options = {}) {
        const title = options.title || 'Select Rule';
        const multiple = options.multiple !== false; // Default true

        // Load rules
        let rules = [];
        try {
            rules = await RulesDB.list();
        } catch (e) {
            console.error(e);
            return;
        }

        const content = document.createElement('div');
        content.className = 'resource-picker';

        // Render
        const render = (filter = '') => {
            const lowerFilter = filter.toLowerCase();
            const filtered = rules.filter(r =>
                !filter ||
                (r.data?.name || r.id).toLowerCase().includes(lowerFilter) ||
                (r.type || '').toLowerCase().includes(lowerFilter)
            );

            content.innerHTML = `
                <div class="picker-search">
                    <input type="text" class="input input-sm" placeholder="Search rules..." value="${Utils.escapeHtml(filter)}">
                </div>
                <div class="picker-list">
                    ${filtered.map(r => `
                        <label class="picker-item">
                            <input type="${multiple ? 'checkbox' : 'radio'}" name="picker_select" value="${r.id}">
                            <div class="picker-item-info">
                                <div class="picker-item-title">${Utils.escapeHtml(r.data?.name || 'Unnamed Rule')}</div>
                                <div class="picker-item-meta">${r.type || 'Rule'}</div>
                            </div>
                        </label>
                    `).join('')}
                    ${filtered.length === 0 ? '<div class="text-muted p-2">No rules found</div>' : ''}
                </div>
            `;

            // Re-bind search
            const input = content.querySelector('input[type="text"]');
            input.oninput = (e) => {
                // simple debounce could be added
                render(e.target.value);
                // refocus
                const newInput = content.querySelector('input[type="text"]');
                newInput.focus();
                // move cursor to end
                newInput.setSelectionRange(newInput.value.length, newInput.value.length);
            };
        };

        render();

        const modal = new Modal({
            title,
            content,
            width: '500px',
            actions: [
                { label: 'Cancel', className: 'btn btn-secondary', onClick: (m) => m.close() },
                {
                    label: 'Select',
                    className: 'btn btn-primary',
                    onClick: (m) => {
                        const checked = Array.from(content.querySelectorAll('input[name="picker_select"]:checked'));
                        const selectedIds = checked.map(el => el.value);
                        const selectedRules = rules.filter(r => selectedIds.includes(r.id));

                        if (options.onSelect) {
                            options.onSelect(selectedRules);
                        }
                        m.close();
                    }
                }
            ]
        });

        modal.show();
    }
};
