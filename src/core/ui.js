/**
 * Core UI Logic
 * Handles sidebar navigation, panel rendering, and theme toggling.
 * Uses State module for session persistence.
 * @module Core/UI
 */

import { State } from './state.js';

export const UI = {
    /** @type {Object.<string, Object>} Registry of loaded panels */
    panels: {},

    /** @type {string|null} ID of current active panel */
    activePanelId: null,

    /**
     * Initialize the UI System
     */
    init: function () {
        // Initialize State first
        State.init();

        this.renderSidebar();
        this.bindEvents();

        // Restore last theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Restore last panel from State
        if (State.session.activePanel && this.panels[State.session.activePanel]) {
            this.switchPanel(State.session.activePanel);
        }
    },

    /**
     * Register a panel definition
     * @param {string} id - Unique Panel ID
     * @param {Object} def - Panel Definition { label, icon, render }
     */
    registerPanel: function (id, def) {
        this.panels[id] = def;
        this.renderSidebar();
    },

    /**
     * Switch to a specific panel
     * @param {string} id 
     */
    switchPanel: function (id) {
        if (!this.panels[id]) return;

        this.activePanelId = id;

        // Save to State
        State.updateSession({ activePanel: id });

        // Update Sidebar
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active', el.dataset.id === id);
        });

        // Render Panel
        const container = document.getElementById('main-view');
        container.innerHTML = '';

        const panelContainer = document.createElement('div');
        panelContainer.className = 'panel-container';

        // Call the panel's render function
        this.panels[id].render(panelContainer, State);

        container.appendChild(panelContainer);
    },

    /**
     * Render the sidebar navigation items
     */
    renderSidebar: function () {
        const navContainer = document.getElementById('nav-list');
        if (!navContainer) return;
        navContainer.innerHTML = '';

        Object.keys(this.panels).forEach(id => {
            const panel = this.panels[id];

            const item = document.createElement('div');
            item.className = 'nav-item';
            item.innerHTML = panel.icon || '📦';
            item.title = panel.label || id;
            item.dataset.id = id;

            item.onclick = () => this.switchPanel(id);

            if (id === this.activePanelId) {
                item.classList.add('active');
            }

            navContainer.appendChild(item);
        });
    },

    /**
     * Bind global UI events
     */
    bindEvents: function () {
        // Theme Toggle
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.onclick = () => {
                const doc = document.documentElement;
                const current = doc.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';

                doc.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
            };
        }
    }
};
