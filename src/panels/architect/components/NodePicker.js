/**
 * Component: Node Picker
 * Modal for selecting node type when creating nodes in Architect.
 * @module Architect/Components/NodePicker
 */

import { Modal } from '../../../components/modal/index.js';
import { VaultDB } from '../../../core/vault.js';
import { getCategoryById, getAllCategories } from '../../../core/categories.js';

// Node type definitions
export const NODE_TYPES = {
    event: {
        id: 'event',
        label: 'Event',
        icon: '⚡',
        color: '#4ade80',
        description: 'Triggers like "On Combat Start", "On Turn Begin"',
        templates: [
            { title: 'On Start', outputs: ['next'] },
            { title: 'On Turn Begin', outputs: ['next'] },
            { title: 'On Attack', inputs: ['attacker', 'target'], outputs: ['next'] },
            { title: 'On Damage', inputs: ['target', 'amount'], outputs: ['next'] }
        ]
    },
    condition: {
        id: 'condition',
        label: 'Condition',
        icon: '❓',
        color: '#facc15',
        description: 'If/else branching logic',
        templates: [
            { title: 'If Greater Than', inputs: ['a', 'b'], outputs: ['true', 'false'] },
            { title: 'If Equal', inputs: ['a', 'b'], outputs: ['true', 'false'] },
            { title: 'If Has Tag', inputs: ['target', 'tag'], outputs: ['true', 'false'] },
            { title: 'Compare Roll', inputs: ['roll', 'dc'], outputs: ['success', 'failure'] }
        ]
    },
    action: {
        id: 'action',
        label: 'Action',
        icon: '🎲',
        color: '#60a5fa',
        description: 'Roll dice, modify values, apply effects',
        templates: [
            { title: 'Roll Dice', inputs: ['expression'], outputs: ['result', 'next'] },
            { title: 'Add Value', inputs: ['a', 'b'], outputs: ['result'] },
            { title: 'Apply Damage', inputs: ['target', 'amount'], outputs: ['next'] },
            { title: 'Set Variable', inputs: ['name', 'value'], outputs: ['next'] }
        ]
    },
    reference: {
        id: 'reference',
        label: 'Reference',
        icon: '📚',
        color: '#c084fc',
        description: 'Link to Library entries (items, abilities, characters)',
        templates: [] // Populated dynamically from VaultDB
    }
};

export class NodePicker {
    constructor(options = {}) {
        this.onSelect = options.onSelect || null;
    }

    async show() {
        const content = document.createElement('div');
        content.className = 'node-picker';

        // Tabs
        const tabs = document.createElement('div');
        tabs.className = 'library-tabs';
        tabs.style.marginBottom = '16px';

        const panels = document.createElement('div');
        panels.className = 'node-picker-panels';

        let activeTab = 'event';

        const renderTab = async (typeId) => {
            activeTab = typeId;

            // Update tab active state
            tabs.querySelectorAll('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.type === typeId);
            });

            // Render panel content
            panels.innerHTML = '';
            const type = NODE_TYPES[typeId];

            if (typeId === 'reference') {
                // Load Library entries
                await VaultDB.init();
                const entries = await VaultDB.list();

                if (entries.length === 0) {
                    panels.innerHTML = '<div class="text-muted">No Library entries. Create entries in the Library first.</div>';
                    return;
                }

                const grid = document.createElement('div');
                grid.className = 'grid-2';
                grid.style.gap = '8px';

                entries.forEach(entry => {
                    const cat = getCategoryById(entry.type);
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-secondary';
                    btn.style.cssText = 'justify-content:flex-start; padding:8px 12px; text-align:left;';
                    btn.innerHTML = `<span style="margin-right:8px;">${cat.icon}</span> ${entry.data.name || 'Untitled'}`;
                    btn.onclick = () => {
                        if (this.onSelect) {
                            this.onSelect({
                                type: 'reference',
                                title: `📚 ${entry.data.name || 'Untitled'}`,
                                entryId: entry.id,
                                entryType: entry.type,
                                inputs: ['in'],
                                outputs: ['out', 'data']
                            });
                        }
                        modal.close();
                    };
                    grid.appendChild(btn);
                });

                panels.appendChild(grid);
            } else {
                // Template buttons
                const grid = document.createElement('div');
                grid.className = 'grid-2';
                grid.style.gap = '8px';

                type.templates.forEach(template => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-secondary';
                    btn.style.cssText = 'justify-content:flex-start; padding:8px 12px;';
                    btn.innerHTML = `<span style="margin-right:8px;">${type.icon}</span> ${template.title}`;
                    btn.onclick = () => {
                        if (this.onSelect) {
                            this.onSelect({
                                type: typeId,
                                title: template.title,
                                inputs: template.inputs || [],
                                outputs: template.outputs || []
                            });
                        }
                        modal.close();
                    };
                    grid.appendChild(btn);
                });

                panels.appendChild(grid);
            }
        };

        // Build tabs
        Object.values(NODE_TYPES).forEach(type => {
            const tab = document.createElement('button');
            tab.className = 'tab';
            tab.dataset.type = type.id;
            tab.innerHTML = `${type.icon} ${type.label}`;
            tab.onclick = () => renderTab(type.id);
            tabs.appendChild(tab);
        });

        content.appendChild(tabs);
        content.appendChild(panels);

        const modal = new Modal({
            title: 'Add Node',
            content,
            actions: [
                { label: 'Cancel', className: 'btn btn-secondary', onClick: (m) => m.close() }
            ]
        });
        modal.show();

        // Initial render
        await renderTab('event');
    }
}
