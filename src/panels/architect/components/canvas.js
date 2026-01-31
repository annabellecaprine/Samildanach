/**
 * Architect: Canvas Manager
 * Handles panning, zooming, and node management.
 */

export class NodeCanvas {
    constructor(container, nodeLayer, svgLayer) {
        this.container = container;
        this.nodeLayer = nodeLayer;
        this.svgLayer = svgLayer;

        this.nodes = [];
        this.links = []; // { fromNode, fromSocket, toNode, toSocket }

        this.transform = { x: 0, y: 0, scale: 1 };
        this.isDragging = false;
        this.lastMouse = { x: 0, y: 0 };

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

        window.onmousemove = (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouse.x;
                const dy = e.clientY - this.lastMouse.y;
                this.transform.x += dx;
                this.transform.y += dy;
                this.lastMouse = { x: e.clientX, y: e.clientY };
                this.updateTransform();
            }
        };

        window.onmouseup = (e) => {
            this.isDragging = false;
            this.container.style.cursor = 'default';
        };

        // Wheel Zoom
        this.container.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.transform.scale *= delta;
            // Clamp
            this.transform.scale = Math.min(Math.max(0.2, this.transform.scale), 2);
            this.updateTransform();
        };
    }

    /**
     * Export current canvas state
     */
    exportData() {
        return {
            nodes: this.nodes,
            links: this.links,
            transform: this.transform
        };
    }

    /**
     * Import canvas state
     */
    importData(data) {
        if (!data) return;

        // Clear existing
        this.nodes = [];
        this.nodeLayer.innerHTML = '';

        // Restore Transform
        if (data.transform) {
            this.transform = data.transform;
            this.updateTransform();
        }

        // Restore Nodes
        if (data.nodes) {
            data.nodes.forEach(n => this.addNode(n, true)); // true = skip save trigger
        }

        // Restore Links (Future)
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
        el.className = 'node';
        el.id = data.id;
        el.style.left = data.x + 'px';
        el.style.top = data.y + 'px';

        let inputsHtml = (data.inputs || []).map(p => `
            <div class="socket-row">
                <div class="socket input" title="${p}"></div>
                <span>${p}</span>
            </div>
        `).join('');

        let outputsHtml = (data.outputs || []).map(p => `
            <div class="socket-row" style="justify-content: flex-end;">
                <span>${p}</span>
                <div class="socket output" title="${p}"></div>
            </div>
        `).join('');

        el.innerHTML = `
            <div class="node-header">${data.title}</div>
            <div class="node-body">
                ${inputsHtml}
                <!-- Body content could go here -->
                ${outputsHtml}
            </div>
        `;

        // Node Drag Logic
        const header = el.querySelector('.node-header');
        let dragNode = false;
        let startPos = { x: 0, y: 0 }; // Mouse start
        let initialPos = { x: data.x, y: data.y }; // Node start

        header.onmousedown = (e) => {
            if (e.button !== 0) return;
            dragNode = true;
            startPos = { x: e.clientX, y: e.clientY };
            initialPos = { x: data.x, y: data.y };
            el.classList.add('selected');
            e.stopPropagation();
        };

        // We bind to window to catch drags outside the node
        const moveHandler = (e) => {
            if (dragNode) {
                const dx = (e.clientX - startPos.x) / this.transform.scale;
                const dy = (e.clientY - startPos.y) / this.transform.scale;
                data.x = initialPos.x + dx;
                data.y = initialPos.y + dy;
                el.style.left = data.x + 'px';
                el.style.top = data.y + 'px';

                // Redraw links connected to this node
                // For prototype efficiency, we just redraw all links
                this.updateLinks();
            }
        };

        const upHandler = () => {
            if (dragNode) {
                dragNode = false;
                el.classList.remove('selected');
                this.notifyChange(); // Save on drag end
            }
        };

        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', upHandler);

        return el;
    }

    // Link Drawing Logic
    updateLinks() {
        // Prototype: Just mock a link for now to prove SVG works
        // Ideally we iterate this.links array and calculate socket positions

        // This is a placeholder as full socket tracking is complex.
        this.svgLayer.innerHTML = '';

        // Example: If we have > 1 node, draw a line between them
        if (this.nodes.length >= 2) {
            const n1 = this.nodes[0];
            const n2 = this.nodes[1];

            // Calculate screen positions
            // SVG is in screen space? No, SVG is inside connection-layer which is absolute.
            // But we need to account for pan/zoom on the nodes.
            // Actually, simpler approach: Apply the same transform to the SVG container? 
            // Or map coordinates.

            // Let's just map coords for now.
            const x1 = (n1.x + 200) * this.transform.scale + this.transform.x; // Right side of node 1
            const y1 = (n1.y + 40) * this.transform.scale + this.transform.y;

            const x2 = (n2.x) * this.transform.scale + this.transform.x; // Left side of node 2
            const y2 = (n2.y + 40) * this.transform.scale + this.transform.y;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Bezier Curve
            const cx1 = x1 + 50 * this.transform.scale;
            const cx2 = x2 - 50 * this.transform.scale;

            const d = `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'connection-line');
            this.svgLayer.appendChild(path);
        }
    }
}
