/**
 * Panel: Architect
 * The Visual Rules Editor with named flows and node wiring.
 */

import { NodeCanvas } from './components/canvas.js';
import { NodePicker } from './components/NodePicker.js';
import { FlowsDB } from '../../core/flows-db.js';
import { Utils } from '../../core/utils.js';
import { Modal } from '../../components/modal/index.js';
import { Toast } from '../../components/toast/index.js';

export const ArchitectPanel = {
    id: 'architect',
    label: 'Architect',
    icon: '📐',

    // Persist active flow across renders
    _state: {
        activeFlowId: null
    },

    /**
     * Render the panel content
     * @param {HTMLElement} container 
     * @param {Object} state 
     */
    render: async (container, state) => {
        container.style.padding = '0';

        await FlowsDB.init();
        let flows = await FlowsDB.list();

        // Restore or create default flow
        let activeFlowId = ArchitectPanel._state.activeFlowId;
        if (!activeFlowId || !flows.find(f => f.id === activeFlowId)) {
            if (flows.length === 0) {
                // Create default flow
                const defaultFlow = await FlowsDB.create('Main Flow');
                flows = [defaultFlow];
            }
            activeFlowId = flows[0].id;
            ArchitectPanel._state.activeFlowId = activeFlowId;
        }

        let activeFlow = await FlowsDB.get(activeFlowId);
        let canvas = null;

        async function render() {
            flows = await FlowsDB.list();
            activeFlow = await FlowsDB.get(activeFlowId);

            container.innerHTML = `
                <div class="architect-workspace" id="arch-workspace">
                    <div class="connection-layer" id="arch-connections">
                        <svg width="100%" height="100%" id="arch-svg"></svg>
                    </div>
                    <div class="node-layer" id="arch-nodes"></div>
                    
                    <div class="architect-toolbar">
                        <div class="toolbar-group">
                            <select id="flow-selector" class="input input-sm">
                                ${flows.map(f => `
                                    <option value="${f.id}" ${f.id === activeFlowId ? 'selected' : ''}>
                                        ${f.name}
                                    </option>
                                `).join('')}
                            </select>
                            <button class="btn btn-ghost btn-sm" id="btn-new-flow" title="New Flow">📂+</button>
                            <button class="btn btn-ghost btn-sm" id="btn-rename-flow" title="Rename">✏️</button>
                            <button class="btn btn-ghost btn-sm" id="btn-delete-flow" title="Delete Flow">🗑️</button>
                        </div>
                        <div class="toolbar-divider"></div>
                        <button class="btn btn-primary btn-sm" id="btn-add-node">+ Add Node</button>
                        <button class="btn btn-secondary btn-sm" id="btn-reset-view">Center</button>
                        <button class="btn btn-secondary btn-sm" id="btn-clear-all">Clear</button>
                        <div class="toolbar-spacer"></div>
                        <span class="toolbar-hint">Drag sockets to connect • Middle-click to pan</span>
                    </div>
                </div>
            `;

            const workspace = container.querySelector('#arch-workspace');
            const nodeLayer = container.querySelector('#arch-nodes');
            const svgLayer = container.querySelector('#arch-svg');

            canvas = new NodeCanvas(workspace, nodeLayer, svgLayer);
            canvas.init();

            // Load flow data into canvas
            if (activeFlow) {
                canvas.importData({
                    nodes: activeFlow.nodes || [],
                    links: activeFlow.links || [],
                    transform: activeFlow.transform || { x: 0, y: 0, scale: 1 }
                });
            }

            // Auto-save on canvas change
            canvas.onDataChange = async (data) => {
                if (activeFlow) {
                    activeFlow.nodes = data.nodes;
                    activeFlow.links = data.links;
                    activeFlow.transform = data.transform;
                    await FlowsDB.update(activeFlow);
                }
            };

            // Flow selector
            container.querySelector('#flow-selector').onchange = async (e) => {
                activeFlowId = e.target.value;
                ArchitectPanel._state.activeFlowId = activeFlowId;
                render();
            };

            // New Flow
            container.querySelector('#btn-new-flow').onclick = async () => {
                const name = await Modal.prompt('Flow name:', 'New Flow');
                if (!name) return;

                const newFlow = await FlowsDB.create(name);
                activeFlowId = newFlow.id;
                ArchitectPanel._state.activeFlowId = activeFlowId;
                render();
            };

            // Rename Flow
            container.querySelector('#btn-rename-flow').onclick = async () => {
                if (!activeFlow) return;
                const name = await Modal.prompt('Rename flow:', activeFlow.name);
                if (!name) return;

                activeFlow.name = name;
                await FlowsDB.update(activeFlow);
                render();
            };

            // Delete Flow
            container.querySelector('#btn-delete-flow').onclick = async () => {
                if (!activeFlow) return;
                if (flows.length <= 1) {
                    Toast.show('Cannot delete the last flow.', 'warning');
                    return;
                }
                const confirmed = await Modal.confirm('Delete Flow', `Delete "${activeFlow.name}"?`);
                if (!confirmed) return;

                await FlowsDB.delete(activeFlow.id);
                flows = await FlowsDB.list();
                activeFlowId = flows[0]?.id;
                ArchitectPanel._state.activeFlowId = activeFlowId;
                render();
                Toast.show('Flow deleted', 'success');
            };

            // Node Picker
            const nodePicker = new NodePicker({
                onSelect: (nodeData) => {
                    canvas.addNode({
                        id: Utils.generateId('node'),
                        x: 100 + (Math.random() * 100),
                        y: 100 + (Math.random() * 100),
                        type: nodeData.type,
                        title: nodeData.title,
                        inputs: nodeData.inputs || [],
                        outputs: nodeData.outputs || [],
                        entryId: nodeData.entryId || null,
                        entryType: nodeData.entryType || null,
                        ruleId: nodeData.ruleId || null,
                        ruleType: nodeData.ruleType || null,
                        flowId: nodeData.flowId || null // For compound nodes
                    });
                }
            });

            container.querySelector('#btn-add-node').onclick = () => {
                nodePicker.show();
            };

            container.querySelector('#btn-reset-view').onclick = () => {
                canvas.resetView();
            };

            container.querySelector('#btn-clear-all').onclick = async () => {
                const confirmed = await Modal.confirm('Clear Nodes', 'Clear all nodes in this flow?');
                if (confirmed) {
                    canvas.nodes = [];
                    canvas.links = [];
                    nodeLayer.innerHTML = '';
                    svgLayer.innerHTML = '';
                    canvas.notifyChange();
                    Toast.show('Flow cleared', 'success');
                }
            };
        }

        await render();
    }
};
