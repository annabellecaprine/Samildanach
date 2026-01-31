/**
 * Panel: Architect
 * The Visual Rules Editor.
 */

// Load styles dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = './panels/architect/architect.css'; // Path relative to index.html
document.head.appendChild(link);

import { NodeCanvas } from './components/canvas.js';
import { Utils } from '../../core/utils.js';

export const ArchitectPanel = {
    id: 'architect',
    label: 'Architect',
    icon: '📐', // Ruler

    /**
     * Render the panel content
     * @param {HTMLElement} container 
     * @param {Object} state 
     */
    render: (container, state) => {
        container.style.padding = '0'; // Full bleed for canvas

        // Scaffolding
        container.innerHTML = `
            <div class="architect-workspace" id="arch-workspace">
                <div class="connection-layer" id="arch-connections">
                    <svg width="100%" height="100%" id="arch-svg"></svg>
                </div>
                <div class="node-layer" id="arch-nodes">
                    <!-- Nodes injected here -->
                </div>
                
                <div class="architect-toolbar">
                    <button class="btn-primary" id="btn-add-node">+ Add Logic</button>
                    <button class="btn-secondary" id="btn-reset-view">Center</button>
                    <div style="width:1px; background:var(--border-subtle); margin:0 4px;"></div>
                    <span style="font-size:12px; color:var(--text-muted); align-self:center;">Pan: Middle Click / Space+Drag</span>
                </div>
            </div>
        `;

        // Initialize Canvas Logic
        const workspace = container.querySelector('#arch-workspace');
        const nodeLayer = container.querySelector('#arch-nodes');
        const svgLayer = container.querySelector('#arch-svg');

        const canvas = new NodeCanvas(workspace, nodeLayer, svgLayer);
        canvas.init();

        // Bind Toolbar
        container.querySelector('#btn-add-node').onclick = () => {
            canvas.addNode({
                id: Utils.generateId('node'),
                x: 100 + (Math.random() * 50),
                y: 100 + (Math.random() * 50),
                title: 'Logic Block',
                inputs: ['in'],
                outputs: ['out', 'true', 'false']
            });
        };

        container.querySelector('#btn-reset-view').onclick = () => {
            canvas.resetView();
        };

        // Persistence Logic
        const STORAGE_KEY = 'samildanach_architect_layout';

        // Save Handler
        canvas.onDataChange = (data) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        };

        // Load Handler
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                canvas.importData(data);
            } catch (e) {
                console.error("Failed to load architect layout:", e);
                // Fallback to demo
                addDemoNodes();
            }
        } else {
            addDemoNodes();
        }

        // Helper to add demo data
        function addDemoNodes() {
            if (canvas.nodes.length === 0) {
                canvas.addNode({ id: 'start', x: 50, y: 50, title: 'Event: Start', outputs: ['next'] });
                canvas.addNode({ id: 'd20', x: 300, y: 100, title: 'Action: Roll D20', inputs: ['prev'], outputs: ['next', 'value'] });
            }
        }
    }
};
