/**
 * Component: Tour
 * Guided tour system for onboarding.
 * Highlights elements and shows explanatory popovers.
 * @module Components/Tour
 */

export const Tour = {
    active: false,
    currentStep: 0,
    currentConfig: null,
    els: {},

    // Registry of tours
    configs: {},

    /**
     * Register a tour configuration
     * @param {string} id - Tour ID
     * @param {Array} steps - Array of { target, title, content }
     */
    register: function (id, steps) {
        this.configs[id] = steps;
    },

    /**
     * Start a tour
     * @param {string} id - Tour ID
     */
    start: function (id) {
        const config = this.configs[id];
        if (!config || !config.length) {
            console.warn(`Tour "${id}" not found.`);
            return;
        }

        this.currentConfig = config;
        // Find first valid step (skip hidden targets)
        this.currentStep = 0;
        this.active = true;

        this.createOverlay();
        this.renderStep();

        document.addEventListener('keydown', this.handleKey);
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, { capture: true });
    },

    end: function () {
        this.active = false;
        this.currentConfig = null;
        this.currentStep = 0;
        this.removeOverlay();
        document.removeEventListener('keydown', this.handleKey);
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll, { capture: true });
    },

    createOverlay: function () {
        if (this.els.overlay) return;

        const overlay = document.createElement('div');
        overlay.className = 'tour-overlay';
        overlay.innerHTML = `
            <div class="tour-highlight"></div>
            <div class="tour-popup">
                <div class="tour-header">
                    <strong id="tour-title"></strong>
                    <button class="btn-icon btn-sm" id="tour-close">&times;</button>
                </div>
                <div class="tour-body" id="tour-content"></div>
                <div class="tour-footer">
                    <span id="tour-progress" class="text-muted text-xs"></span>
                    <div class="tour-actions">
                        <button class="btn btn-secondary btn-sm" id="tour-prev">Prev</button>
                        <button class="btn btn-primary btn-sm" id="tour-next">Next</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        this.els = {
            overlay,
            highlight: overlay.querySelector('.tour-highlight'),
            popup: overlay.querySelector('.tour-popup'),
            title: overlay.querySelector('#tour-title'),
            content: overlay.querySelector('#tour-content'),
            progress: overlay.querySelector('#tour-progress'),
            btnPrev: overlay.querySelector('#tour-prev'),
            btnNext: overlay.querySelector('#tour-next'),
            btnClose: overlay.querySelector('#tour-close')
        };

        this.els.btnClose.onclick = () => this.end();
        this.els.btnPrev.onclick = () => this.prev();
        this.els.btnNext.onclick = () => this.next();
    },

    removeOverlay: function () {
        if (this.els.overlay) {
            this.els.overlay.remove();
            this.els = {};
        }
    },

    renderStep: function () {
        if (!this.active || !this.currentConfig) return;

        const step = this.currentConfig[this.currentStep];

        // Find target
        const target = document.querySelector(step.target);
        if (!target) {
            // If target missing, maybe skip or just center?
            // Let's try to center if missing, or auto-skip
            console.warn(`Tour target "${step.target}" not found.`);
        }

        this.els.title.innerText = step.title;
        this.els.content.innerHTML = step.content;
        this.els.progress.innerText = `${this.currentStep + 1} / ${this.currentConfig.length}`;

        this.els.btnPrev.disabled = this.currentStep === 0;
        this.els.btnNext.innerText = this.currentStep === this.currentConfig.length - 1 ? 'Finish' : 'Next';

        this.positionOverlay(target);
    },

    positionOverlay: function (target) {
        if (!target) {
            this.els.highlight.style.opacity = '0';
            this.centerPopup();
            return;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Wait a tick for scroll
        setTimeout(() => {
            const rect = target.getBoundingClientRect();
            const pad = 4;

            // Highlight
            this.els.highlight.style.width = `${rect.width + (pad * 2)}px`;
            this.els.highlight.style.height = `${rect.height + (pad * 2)}px`;
            this.els.highlight.style.top = `${rect.top - pad}px`;
            this.els.highlight.style.left = `${rect.left - pad}px`;
            this.els.highlight.style.opacity = '1';

            // Popup Placement
            this.placePopup(rect);
        }, 100);
    },

    placePopup: function (targetRect) {
        const popup = this.els.popup;
        const pRect = popup.getBoundingClientRect();
        const margin = 16;
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;

        let top, left;

        // Try Right
        if (targetRect.right + pRect.width + margin < viewW) {
            top = targetRect.top;
            left = targetRect.right + margin;
        }
        // Try Left
        else if (targetRect.left - pRect.width - margin > 0) {
            top = targetRect.top;
            left = targetRect.left - pRect.width - margin;
        }
        // Try Bottom
        else if (targetRect.bottom + pRect.height + margin < viewH) {
            top = targetRect.bottom + margin;
            left = targetRect.left;
        }
        // Try Top
        else if (targetRect.top - pRect.height - margin > 0) {
            top = targetRect.top - pRect.height - margin;
            left = targetRect.left;
        }
        else {
            this.centerPopup();
            return;
        }

        // Clamp to viewport
        if (top < margin) top = margin;
        if (left < margin) left = margin;
        if (top + pRect.height > viewH - margin) top = viewH - margin - pRect.height;
        if (left + pRect.width > viewW - margin) left = viewW - margin - pRect.width;

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
        popup.style.transform = 'none';
    },

    centerPopup: function () {
        const popup = this.els.popup;
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    },

    next: function () {
        if (this.currentStep < this.currentConfig.length - 1) {
            this.currentStep++;
            this.renderStep();
        } else {
            this.end();
        }
    },

    prev: function () {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    },

    handleKey: function (e) {
        if (!Tour.active) return;
        if (e.key === 'Escape') Tour.end();
        if (e.key === 'ArrowRight') Tour.next();
        if (e.key === 'ArrowLeft') Tour.prev();
    },

    handleResize: function () {
        if (Tour.active) Tour.renderStep();
    },

    handleScroll: function () {
        // Debounce or just re-render?
        // Re-rendering on scroll can be jittery, but necessary if target moves.
        // For now, we'll leave it, as sidebar items align to viewport.
    }
};

// Bind context
Tour.handleKey = Tour.handleKey.bind(Tour);
Tour.handleResize = Tour.handleResize.bind(Tour);
Tour.handleScroll = Tour.handleScroll.bind(Tour);

// Register Default Tour
Tour.register('getting-started', [
    {
        target: '.nav-item[data-id="project"]',
        title: 'Project Home',
        content: 'Your command center. Manage project details, import/export data, and see an overview of your world.'
    },
    {
        target: '.nav-item[data-id="library"]',
        title: 'The Library',
        content: 'A taxonomical database for your world. Create and organize Stories, Characters, Locations, and Items.'
    },
    {
        target: '.nav-item[data-id="grimoire"]',
        title: 'The Grimoire',
        content: 'Define the Rules of your system. Create Spells, Feats, and Abilities with custom data fields.'
    },
    {
        target: '.nav-item[data-id="architect"]',
        title: 'The Architect',
        content: 'A powerful Visual Node Editor. Design logic flows, encounter structures, and complex systems.'
    },
    {
        target: '.nav-item[data-id="laboratory"]',
        title: 'The Laboratory',
        content: 'Test and balance your mechanics. Roll dice, run probability simulations, and compare math.'
    },
    {
        target: '.nav-item[data-id="scribe"]',
        title: 'The Scribe',
        content: 'AI-assisted world-building. Chat with an AI that knows your library to brainstorm and expand your ideas.'
    },
    {
        target: '.nav-item[data-id="export"]',
        title: 'System Tools',
        content: 'Export your entire project to JSON/Markdown, configure LLM settings, and manage themes.'
    }
]);
