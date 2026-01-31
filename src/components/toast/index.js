/**
 * Component: ToastNotification
 * Non-blocking floating notifications.
 * @module Components/Toast
 */

export const Toast = {
    container: null,

    /**
     * Show a toast message
     * @param {string} message - Text to display
     * @param {string} type - 'info', 'success', 'warning', 'error'
     * @param {number} duration - Time in ms (default 3000)
     */
    show: function (message, type = 'info', duration = 3000) {
        this.ensureContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">&times;</button>
        `;

        // Close button
        toast.querySelector('.toast-close').onclick = () => {
            this.dismiss(toast);
        };

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    },

    dismiss: function (toast) {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        });
    },

    ensureContainer: function () {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    getIcon: function (type) {
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'info':
            default: return 'ℹ️';
        }
    }
};

// Expose globally for convenience if desired, or just export
window.Toast = Toast;
