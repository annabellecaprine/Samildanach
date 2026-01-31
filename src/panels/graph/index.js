/**
 * Panel: Graph
 * Visual World Graph - Mind-map view of entries and relationships.
 */

import { VaultDB } from '../../core/vault.js';
import { getCategoryById } from '../../core/categories.js';
import { getRelationshipById } from '../../core/relationships.js';

export const GraphPanel = {
    id: 'graph',
    label: 'Graph',
    icon: '🕸️',

    render: async (container, state) => {
        try {
            await VaultDB.init();
        } catch (e) {
            container.innerHTML = `<div class="text-muted">Vault Error: ${e.message}</div>`;
            return;
        }

        container.style.padding = '0';
        container.innerHTML = `
            <div class="graph-layout">
                <!-- Toolbar -->
                <div class="graph-toolbar">
                    <span class="graph-toolbar-icon">🕸️</span>
                    <span class="graph-toolbar-title">World Graph</span>
                    <span class="toolbar-spacer"></span>
                    <button id="graph-reset" class="btn btn-secondary">Reset View</button>
                    <button id="graph-relayout" class="btn btn-primary">Re-layout</button>
                </div>
                
                <!-- Canvas -->
                <div id="graph-container" class="graph-container">
                    <canvas id="graph-canvas" class="graph-canvas"></canvas>
                    <div id="graph-nodes" class="graph-nodes"></div>
                </div>
            </div>
        `;

        const graphContainer = container.querySelector('#graph-container');
        const canvas = container.querySelector('#graph-canvas');
        const ctx = canvas.getContext('2d');

        // Resize canvas
        const resize = () => {
            canvas.width = graphContainer.clientWidth;
            canvas.height = graphContainer.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Load data
        const allItems = await VaultDB.list();

        // Build node and edge data
        const nodes = allItems.map((item, i) => {
            const cat = getCategoryById(item.type);
            const angle = (i / allItems.length) * Math.PI * 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.3;
            return {
                id: item.id,
                item: item,
                label: item.data.name || 'Untitled',
                icon: cat.icon,
                color: cat.color,
                x: canvas.width / 2 + Math.cos(angle) * radius,
                y: canvas.height / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0
            };
        });

        const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

        const edges = [];
        allItems.forEach(item => {
            (item.data.relationships || []).forEach(rel => {
                if (nodeMap[rel.targetId]) {
                    const relType = getRelationshipById(rel.type);
                    edges.push({
                        from: item.id,
                        to: rel.targetId,
                        label: relType.label,
                        color: relType.icon
                    });
                }
            });
        });

        // Pan/Zoom state
        let transform = { x: 0, y: 0, scale: 1 };
        let isPanning = false;
        let lastMouse = { x: 0, y: 0 };
        let dragNode = null;

        // Render loop
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(transform.x, transform.y);
            ctx.scale(transform.scale, transform.scale);

            // Draw edges
            ctx.lineWidth = 2;
            edges.forEach(edge => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (from && to) {
                    ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
                    ctx.beginPath();
                    ctx.moveTo(from.x, from.y);
                    ctx.lineTo(to.x, to.y);
                    ctx.stroke();
                }
            });

            // Draw nodes
            nodes.forEach(node => {
                ctx.fillStyle = node.color || '#6366f1';
                ctx.beginPath();
                ctx.arc(node.x, node.y, 24, 0, Math.PI * 2);
                ctx.fill();

                ctx.font = '16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.fillText(node.icon, node.x, node.y);

                ctx.font = '11px sans-serif';
                ctx.fillStyle = 'var(--text-primary)';
                ctx.fillText(node.label, node.x, node.y + 36);
            });

            ctx.restore();
        };

        // Simple force simulation
        const simulate = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            nodes.forEach(node => {
                nodes.forEach(other => {
                    if (node.id === other.id) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 5000 / (dist * dist);
                    node.vx += (dx / dist) * force;
                    node.vy += (dy / dist) * force;
                });

                node.vx += (centerX - node.x) * 0.001;
                node.vy += (centerY - node.y) * 0.001;
            });

            edges.forEach(edge => {
                const from = nodeMap[edge.from];
                const to = nodeMap[edge.to];
                if (from && to) {
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = (dist - 150) * 0.01;
                    from.vx += (dx / dist) * force;
                    from.vy += (dy / dist) * force;
                    to.vx -= (dx / dist) * force;
                    to.vy -= (dy / dist) * force;
                }
            });

            nodes.forEach(node => {
                if (dragNode !== node) {
                    node.x += node.vx * 0.1;
                    node.y += node.vy * 0.1;
                }
                node.vx *= 0.9;
                node.vy *= 0.9;
            });

            render();
            requestAnimationFrame(simulate);
        };

        simulate();

        // Interaction
        const getMousePos = (e) => ({
            x: (e.offsetX - transform.x) / transform.scale,
            y: (e.offsetY - transform.y) / transform.scale
        });

        const findNodeAt = (x, y) => {
            return nodes.find(n => {
                const dx = n.x - x;
                const dy = n.y - y;
                return Math.sqrt(dx * dx + dy * dy) < 24;
            });
        };

        canvas.onmousedown = (e) => {
            const pos = getMousePos(e);
            const node = findNodeAt(pos.x, pos.y);

            if (node) {
                dragNode = node;
            } else {
                isPanning = true;
                lastMouse = { x: e.clientX, y: e.clientY };
            }
        };

        canvas.onmousemove = (e) => {
            if (dragNode) {
                const pos = getMousePos(e);
                dragNode.x = pos.x;
                dragNode.y = pos.y;
            } else if (isPanning) {
                transform.x += e.clientX - lastMouse.x;
                transform.y += e.clientY - lastMouse.y;
                lastMouse = { x: e.clientX, y: e.clientY };
            }
        };

        canvas.onmouseup = () => {
            dragNode = null;
            isPanning = false;
        };

        canvas.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            transform.scale *= delta;
            transform.scale = Math.min(Math.max(0.3, transform.scale), 3);
        };

        // Toolbar
        container.querySelector('#graph-reset').onclick = () => {
            transform = { x: 0, y: 0, scale: 1 };
        };

        container.querySelector('#graph-relayout').onclick = () => {
            nodes.forEach((node, i) => {
                const angle = (i / nodes.length) * Math.PI * 2;
                const radius = Math.min(canvas.width, canvas.height) * 0.3;
                node.x = canvas.width / 2 + Math.cos(angle) * radius;
                node.y = canvas.height / 2 + Math.sin(angle) * radius;
                node.vx = 0;
                node.vy = 0;
            });
        };
    }
};
