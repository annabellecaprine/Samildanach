/**
 * Panel: Architect
 * The Visual Rules Editor.
 */

import { NodeCanvas } from './components/canvas.js';
import { NodePicker } from './components/NodePicker.js';
import { Utils } from '../../core/utils.js';

export const ArchitectPanel = {
    id: 'architect',
    label: 'Architect',
    icon: '📐',

    /**
     * Render the panel content
     * @param {HTMLElement} container 
     * @param {Object} state 
     */
    render: (container, state) => {
        container.style.padding = '0';

        container.innerHTML = `
            <div class="architect-workspace" id="arch-workspace">
                <div class="connection-layer" id="arch-connections">
                    <svg width="100%" height="100%" id="arch-svg"></svg>
                </div>
                <div class="node-layer" id="arch-nodes"></div>
                
                <div class="architect-toolbar">
                    <button class="btn btn-primary" id="btn-add-node">+ Add Node</button>
                    <button class="btn btn-secondary" id="btn-reset-view">Center</button>
                    <button class="btn btn-secondary" id="btn-clear-all">Clear</button>
                    <div class="toolbar-divider"></div>
                    <span class="toolbar-hint">Pan: Middle Click / Alt+Drag</span>
                </div>
            </div>
        `;

        const workspace = container.querySelector('#arch-workspace');
        const nodeLayer = container.querySelector('#arch-nodes');
        const svgLayer = container.querySelector('#arch-svg');

        const canvas = new NodeCanvas(workspace, nodeLayer, svgLayer);
        canvas.init();

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
                    entryType: nodeData.entryType || null
                });
            }
        });

        container.querySelector('#btn-add-node').onclick = () => {
            nodePicker.show();
        };

        container.querySelector('#btn-reset-view').onclick = () => {
            canvas.resetView();
        };

        container.querySelector('#btn-clear-all').onclick = () => {
            if (confirm('Clear all nodes?')) {
                canvas.nodes = [];
                canvas.links = [];
                nodeLayer.innerHTML = '';
                svgLayer.innerHTML = '';
                canvas.notifyChange();
            }
        };

        // Persistence
        const STORAGE_KEY = 'samildanach_architect_layout';

        canvas.onDataChange = (data) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        };

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                canvas.importData(data);
            } catch (e) {
                console.error("Failed to load architect layout:", e);
                addDemoNodes();
            }
        } else {
            addDemoNodes();
        }

        function addDemoNodes() {
            if (canvas.nodes.length === 0) {
                canvas.addNode({
                    id: 'start', x: 50, y: 50,
                    type: 'event',
                    title: 'On Attack',
                    inputs: ['attacker', 'target'],
                    outputs: ['next']
                });
                canvas.addNode({
                    id: 'd20', x: 300, y: 100,
                    type: 'action',
                    title: 'Roll Dice',
                    inputs: ['expression'],
                    outputs: ['result', 'next']
                });
                canvas.addNode({
                    id: 'check', x: 550, y: 50,
                    type: 'condition',
                    title: 'Compare Roll',
                    inputs: ['roll', 'dc'],
                    outputs: ['success', 'failure']
                });
            }
        }
    }
};
