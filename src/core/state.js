/**
 * Core State Management
 * Centralized runtime state shared across panels.
 * Designed for future .exe/.apk export compatibility.
 * @module Core/State
 */

const STORAGE_KEY = 'samildanach_state';

export const State = {
    // Project metadata
    project: {
        title: 'Untitled Setting',
        author: '',
        version: '1.0.0',
        description: '',
        genre: '',
        system: ''
    },

    // Session state (what's currently open)
    session: {
        activePanel: null,
        activeEntryId: null
    },

    // Runtime cache (non-persisted)
    cache: {},

    // Subscribers for state changes
    _subscribers: [],

    /**
     * Initialize state from localStorage
     */
    init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.project) Object.assign(this.project, data.project);
                if (data.session) Object.assign(this.session, data.session);
            } catch (e) {
                console.warn('Failed to restore state:', e);
            }
        }
    },

    /**
     * Persist current state to localStorage
     */
    save() {
        const data = {
            project: this.project,
            session: this.session
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    },

    /**
     * Update project metadata
     * @param {Partial<typeof State.project>} updates 
     */
    updateProject(updates) {
        Object.assign(this.project, updates);
        this.save();
        this._notify('project', this.project);
    },

    /**
     * Update session state
     * @param {Partial<typeof State.session>} updates 
     */
    updateSession(updates) {
        Object.assign(this.session, updates);
        this.save();
        this._notify('session', this.session);
    },

    /**
     * Subscribe to state changes
     * @param {string} key - 'project' or 'session'
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    subscribe(key, callback) {
        const sub = { key, callback };
        this._subscribers.push(sub);
        return () => {
            const idx = this._subscribers.indexOf(sub);
            if (idx >= 0) this._subscribers.splice(idx, 1);
        };
    },

    /**
     * Notify subscribers of state change
     * @private
     */
    _notify(key, data) {
        this._subscribers
            .filter(s => s.key === key)
            .forEach(s => s.callback(data));
    },

    /**
     * Export all state for bundling
     * @returns {Object}
     */
    exportState() {
        return {
            project: { ...this.project },
            session: { ...this.session }
        };
    },

    /**
     * Import state from bundle
     * @param {Object} data 
     */
    importState(data) {
        if (data.project) Object.assign(this.project, data.project);
        if (data.session) Object.assign(this.session, data.session);
        this.save();
        this._notify('project', this.project);
        this._notify('session', this.session);
    }
};
