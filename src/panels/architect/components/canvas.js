/**
 * Architect: Canvas Manager
 * Handles panning, zooming, node management, and socket wiring.
 */

export class NodeCanvas {
    constructor(container, nodeLayer, svgLayer) {
        this.container = container;
        this.nodeLayer = nodeLayer;
        this.svgLayer = svgLayer;

        this.nodes = [];
        this.links = []; // { id, from: {nodeId, socket}, to: {nodeId, socket} }

        this.transform = { x: 0, y: 0, scale: 1 };
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };

        // Wire drawing state
        this.isWiring = false;
        this.wireFrom = null; // { nodeId, socket, type: 'input'|'output', element }
        this.wireLine = null; // SVG line element for preview

        // Selection
        this.selectedLink = null;

        // Callback
        this.onDataChange = null;
    }

    init() {
        // Pan Events
        this.container.onmousedown = (e) => {
            if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle or Alt+Left
                this.isDragging = true;
                this.lastMouse = { x: e.clientX, y: e.clientY };
                this.container.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        this.container.onmousemove = (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouse.x;
                const dy = e.clientY - this.lastMouse.y;
                this.transform.x += dx;
                this.transform.y += dy;
                this.lastMouse = { x: e.clientX, y: e.clientY };
                this.updateTransform();
            }

            // Wire preview
            if (this.isWiring && this.wireLine) {
                const rect = this.container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                this.updateWirePreview(mouseX, mouseY);
            }
        };

        this.container.onmouseup = (e) => {
            this.isDragging = false;
            this.container.style.cursor = 'default';

            // Cancel wiring if clicking on empty space
            if (this.isWiring) {
                this.cancelWiring();
            }
        };

        // Wheel Zoom
        this.container.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.transform.scale *= delta;
            this.transform.scale = Math.min(Math.max(0.2, this.transform.scale), 2);
            this.updateTransform();
        };

        // Delete key for selected link
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && this.selectedLink) {
                this.deleteLink(this.selectedLink);
                this.selectedLink = null;
            }
        });
    }

    // Export current canvas state
    exportData() {
        return {
            nodes: this.nodes,
            links: this.links,
            transform: this.transform
        };
    }

    // Import canvas state
    importData(data) {
        if (!data) return;

        // Clear existing
        this.nodes = [];
        this.links = [];
        this.nodeLayer.innerHTML = '';

        // Restore Transform
        if (data.transform) {
            this.transform = data.transform;
            this.updateTransform();
        }

        // Restore Nodes
        if (data.nodes) {
            data.nodes.forEach(n => this.addNode(n, true));
        }

        // Restore Links
        this.links = data.links || [];
        this.updateLinks();
    }

    notifyChange() {
        if (this.onDataChange) this.onDataChange(this.exportData());
    }

    updateTransform() {
        this.nodeLayer.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`;
        this.updateLinks();
    }

    resetView() {
        this.transform = { x: 0, y: 0, scale: 1 };
        this.updateTransform();
    }

    addNode(data, silent = false) {
        this.nodes.push(data);
        const el = this.renderNodeElement(data);
        this.nodeLayer.appendChild(el);
        if (!silent) this.notifyChange();
    }

    renderNodeElement(data) {
        const el = document.createElement('div');
        el.className = 'node' + (data.type ? ` ${data.type}` : '');
        el.id = data.id;
        el.style.left = data.x + 'px';
        el.style.top = data.y + 'px';

        let inputsHtml = (data.inputs || []).map(p => `
            <div class="socket-row">
                <div class="socket input" 
                     data-node-id="${data.id}" 
                     data-socket-type="input" 
                     data-socket-name="${p}" 
                     title="${p}"></div>
                <span>${p}</span>
            </div>
        `).join('');

        let outputsHtml = (data.outputs || []).map(p => `
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${p}</span>
                <div class="socket output" 
                     data-node-id="${data.id}" 
                     data-socket-type="output" 
                     data-socket-name="${p}" 
                     title="${p}"></div>
            </div>
        `).join('');

        el.innerHTML = `
            <div class="node-header">${data.title}</div>
            <div class="node-body">
                ${inputsHtml}
                ${outputsHtml}
            </div>
        `;

        // Node Drag Logic
        const header = el.querySelector('.node-header');
        let dragNode = false;
        let startPos = { x: 0, y: 0 };
        let initialPos = { x: data.x, y: data.y };

        header.onmousedown = (e) => {
            if (e.button !== 0) return;
            dragNode = true;
            startPos = { x: e.clientX, y: e.clientY };
            initialPos = { x: data.x, y: data.y };
            el.classList.add('selected');
            e.stopPropagation();
        };

        const moveHandler = (e) => {
            if (dragNode) {
                const dx = (e.clientX - startPos.x) / this.transform.scale;
                const dy = (e.clientY - startPos.y) / this.transform.scale;
                data.x = initialPos.x + dx;
                data.y = initialPos.y + dy;
                el.style.left = data.x + 'px';
                el.style.top = data.y + 'px';
                this.updateLinks();
            }
        };

        const upHandler = () => {
            if (dragNode) {
                dragNode = false;
                el.classList.remove('selected');
                this.notifyChange();
            }
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);

        // Socket wiring events
        el.querySelectorAll('.socket').forEach(socket => {
            socket.onmousedown = (e) => {
                e.stopPropagation();
                this.startWiring(socket);
            };

            socket.onmouseup = (e) => {
                e.stopPropagation();
                if (this.isWiring) {
                    this.completeWiring(socket);
                }
            };
        });

        return el;
    }

    // === WIRING SYSTEM ===

    startWiring(socketEl) {
        const nodeId = socketEl.dataset.nodeId;
        const socketType = socketEl.dataset.socketType;
        const socketName = socketEl.dataset.socketName;

        this.isWiring = true;
        this.wireFrom = { nodeId, socket: socketName, type: socketType, element: socketEl };

        // Create preview line
        this.wireLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.wireLine.setAttribute('class', 'connection-line wiring');
        this.svgLayer.appendChild(this.wireLine);

        socketEl.classList.add('wiring');
    }

    updateWirePreview(mouseX, mouseY) {
        if (!this.wireFrom || !this.wireLine) return;

        const fromPos = this.getSocketPosition(this.wireFrom.element);

        const x1 = fromPos.x;
        const y1 = fromPos.y;
        const x2 = mouseX;
        const y2 = mouseY;

        // Bezier curve
        const cx1 = this.wireFrom.type === 'output' ? x1 + 50 : x1 - 50;
        const cx2 = this.wireFrom.type === 'output' ? x2 - 50 : x2 + 50;

        const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
        this.wireLine.setAttribute('d', d);
    }

    completeWiring(targetSocketEl) {
        if (!this.wireFrom) return;

        const toNodeId = targetSocketEl.dataset.nodeId;
        const toSocketType = targetSocketEl.dataset.socketType;
        const toSocketName = targetSocketEl.dataset.socketName;

        // Validate: must connect output -> input (or input -> output)
        if (this.wireFrom.type === toSocketType) {
            console.log('[Canvas] Cannot connect same socket types');
            this.cancelWiring();
            return;
        }

        // Validate: cannot connect to same node
        if (this.wireFrom.nodeId === toNodeId) {
            console.log('[Canvas] Cannot connect node to itself');
            this.cancelWiring();
            return;
        }

        // Determine direction (always output -> input)
        let from, to;
        if (this.wireFrom.type === 'output') {
            from = { nodeId: this.wireFrom.nodeId, socket: this.wireFrom.socket };
            to = { nodeId: toNodeId, socket: toSocketName };
        } else {
            from = { nodeId: toNodeId, socket: toSocketName };
            to = { nodeId: this.wireFrom.nodeId, socket: this.wireFrom.socket };
        }

        // Check if link already exists
        const exists = this.links.some(l =>
            l.from.nodeId === from.nodeId &&
            l.from.socket === from.socket &&
            l.to.nodeId === to.nodeId &&
            l.to.socket === to.socket
        );

        if (!exists) {
            const link = {
                id: 'link_' + Date.now(),
                from,
                to
            };
            this.links.push(link);
            console.log('[Canvas] Created link:', link);
            this.notifyChange();
        }

        this.cancelWiring();
        this.updateLinks();
    }

    cancelWiring() {
        if (this.wireLine) {
            this.wireLine.remove();
            this.wireLine = null;
        }
        if (this.wireFrom?.element) {
            this.wireFrom.element.classList.remove('wiring');
        }
        this.isWiring = false;
        this.wireFrom = null;
    }

    getSocketPosition(socketEl) {
        const containerRect = this.container.getBoundingClientRect();
        const socketRect = socketEl.getBoundingClientRect();

        return {
            x: socketRect.left + socketRect.width / 2 - containerRect.left,
            y: socketRect.top + socketRect.height / 2 - containerRect.top
        };
    }

    deleteLink(linkId) {
        const idx = this.links.findIndex(l => l.id === linkId);
        if (idx >= 0) {
            this.links.splice(idx, 1);
            this.updateLinks();
            this.notifyChange();
        }
    }

    // === LINK RENDERING ===

    updateLinks() {
        this.svgLayer.innerHTML = '';

        this.links.forEach(link => {
            const fromNode = this.nodeLayer.querySelector(`#${link.from.nodeId}`);
            const toNode = this.nodeLayer.querySelector(`#${link.to.nodeId}`);

            if (!fromNode || !toNode) return;

            const fromSocket = fromNode.querySelector(`.socket.output[data-socket-name="${link.from.socket}"]`);
            const toSocket = toNode.querySelector(`.socket.input[data-socket-name="${link.to.socket}"]`);

            if (!fromSocket || !toSocket) return;

            const fromPos = this.getSocketPosition(fromSocket);
            const toPos = this.getSocketPosition(toSocket);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Bezier Curve
            const cx1 = fromPos.x + 50;
            const cx2 = toPos.x - 50;
            const d = `M ${fromPos.x} ${fromPos.y} C ${cx1} ${fromPos.y}, ${cx2} ${toPos.y}, ${toPos.x} ${toPos.y}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'connection-line' + (link.id === this.selectedLink ? ' selected' : ''));
            path.dataset.linkId = link.id;

            // Click to select
            path.onclick = (e) => {
                e.stopPropagation();
                this.selectedLink = link.id;
                this.updateLinks(); // Re-render to show selection
            };

            this.svgLayer.appendChild(path);
        });
    }
}
