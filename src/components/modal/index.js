/**
 * Component: Modal
 * Reusable modal dialog component.
 * @module Components/Modal
 */

export class Modal {
    /**
     * Create a modal
     * @param {Object} options
     * @param {string} options.title - Modal title
     * @param {string|HTMLElement} options.content - Modal body content
     * @param {Array} options.actions - Array of { label, className, onClick }
     * @param {Function} options.onClose - Called when modal closes
     */
    constructor(options = {}) {
        this.title = options.title || 'Modal';
        this.content = options.content || '';
        this.actions = options.actions || [];
        this.onClose = options.onClose || null;
        this.element = null;
    }

    /**
     * Show the modal
     */
    show() {
        this.element = document.createElement('div');
        this.element.className = 'modal-overlay';
        this.element.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title">${this.title}</h3>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;

        // Body content
        const body = this.element.querySelector('.modal-body');
        if (typeof this.content === 'string') {
            body.innerHTML = this.content;
        } else if (this.content instanceof HTMLElement) {
            body.appendChild(this.content);
        }

        // Actions
        const actionsEl = this.element.querySelector('.modal-actions');
        this.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = action.className || 'btn btn-secondary';
            btn.innerText = action.label;
            btn.onclick = () => {
                if (action.onClick) action.onClick(this);
            };
            actionsEl.appendChild(btn);
        });

        // Close on backdrop click
        this.element.onclick = (e) => {
            if (e.target === this.element) this.close();
        };

        document.body.appendChild(this.element);
    }

    /**
     * Close and remove the modal
     */
    close() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.onClose) this.onClose();
    }

    /**
     * Get the modal body element for dynamic content
     * @returns {HTMLElement}
     */
    getBody() {
        return this.element?.querySelector('.modal-body');
    }

    /**
     * Static helper to show a simple confirm dialog
     * @param {string} title 
     * @param {string} message 
     * @returns {Promise<boolean>}
     */
    static confirm(title, message) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                content: `<p>${message}</p>`,
                actions: [
                    { label: 'Cancel', className: 'btn btn-secondary', onClick: () => { modal.close(); resolve(false); } },
                    { label: 'Confirm', className: 'btn btn-primary', onClick: () => { modal.close(); resolve(true); } }
                ]
            });
            modal.show();
        });
    }

    /**
     * Static helper to show a simple alert dialog
     * @param {string} title 
     * @param {string} message 
     * @returns {Promise<void>}
     */
    static alert(title, message) {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                content: `<p>${message}</p>`,
                actions: [
                    { label: 'OK', className: 'btn btn-primary', onClick: () => { modal.close(); resolve(); } }
                ]
            });
            modal.show();
        });
    }

    /**
     * Static helper to show a simple prompt dialog
     * @param {string} title
     * @param {string} defaultValue
     * @returns {Promise<string|null>}
     */
    static prompt(title, defaultValue = '') {
        return new Promise((resolve) => {
            const content = document.createElement('div');
            content.innerHTML = `
                <input type="text" class="input" style="width:100%" value="${defaultValue}">
            `;
            const input = content.querySelector('input');

            const modal = new Modal({
                title,
                content,
                actions: [
                    { label: 'Cancel', className: 'btn btn-secondary', onClick: () => { modal.close(); resolve(null); } },
                    { label: 'OK', className: 'btn btn-primary', onClick: () => { modal.close(); resolve(input.value); } }
                ]
            });
            modal.show();
            // Focus input
            setTimeout(() => input.focus(), 50);

            // Enter key support
            input.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    modal.close();
                    resolve(input.value);
                }
            };
        });
    }
}
