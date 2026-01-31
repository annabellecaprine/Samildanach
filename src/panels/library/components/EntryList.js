/**
 * Component: Entry List
 * Sidebar list of entries with search and category filter.
 * @module Library/Components/EntryList
 */

import { getCategoryById, getAllCategories } from '../../../core/categories.js';

export class EntryList {
    constructor(container, options = {}) {
        this.container = container;
        this.items = [];
        this.activeCategory = null;
        this.activeItemId = null;
        this.onSelect = options.onSelect || null;
        this.onCreate = options.onCreate || null;
    }

    setItems(items) {
        this.items = items;
        this.render();
    }

    setActiveItem(id) {
        this.activeItemId = id;
        this.renderList();
    }

    render() {
        this.container.innerHTML = `
            <div id="category-tabs" class="library-tabs"></div>
            <div class="library-search-bar">
                <input id="lib-search" type="text" placeholder="Search..." class="input">
                <button id="lib-add-btn" class="btn btn-primary">+</button>
            </div>
            <div id="lib-list" class="library-list"></div>
        `;

        this.tabsEl = this.container.querySelector('#category-tabs');
        this.searchInput = this.container.querySelector('#lib-search');
        this.listEl = this.container.querySelector('#lib-list');
        this.addBtn = this.container.querySelector('#lib-add-btn');

        this.renderTabs();
        this.renderList();

        this.searchInput.oninput = () => this.renderList();
        this.addBtn.onclick = () => { if (this.onCreate) this.onCreate(); };
    }

    renderTabs() {
        this.tabsEl.innerHTML = '';

        // All tab
        const allTab = document.createElement('button');
        allTab.innerText = 'All';
        allTab.className = 'tab' + (this.activeCategory === null ? ' active' : '');
        allTab.onclick = () => { this.activeCategory = null; this.renderTabs(); this.renderList(); };
        this.tabsEl.appendChild(allTab);

        // Category tabs
        getAllCategories().forEach(cat => {
            const tab = document.createElement('button');
            tab.innerText = `${cat.icon} ${cat.label}`;
            tab.className = 'tab' + (this.activeCategory === cat.id ? ' active' : '');
            if (this.activeCategory === cat.id) {
                tab.style.background = cat.color;
                tab.style.borderColor = cat.color;
            }
            tab.onclick = () => { this.activeCategory = cat.id; this.renderTabs(); this.renderList(); };
            this.tabsEl.appendChild(tab);
        });
    }

    renderList() {
        if (!this.listEl) return;
        this.listEl.innerHTML = '';

        const filter = this.searchInput?.value.toLowerCase() || '';
        const catFilter = this.activeCategory;

        const filtered = this.items.filter(i => {
            const nameMatch = (i.data.name || '').toLowerCase().includes(filter);
            const catMatch = catFilter ? i.type === catFilter : true;
            return nameMatch && catMatch;
        });

        if (filtered.length === 0) {
            this.listEl.innerHTML = `<div class="library-list-empty">No entries found.</div>`;
            return;
        }

        filtered.forEach(item => {
            const cat = getCategoryById(item.type);
            const isActive = this.activeItemId === item.id;
            const el = document.createElement('div');
            el.className = 'list-item' + (isActive ? ' active' : '');
            el.innerHTML = `
                <span>${cat.icon}</span>
                <span class="flex-1" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${item.data.name || 'Untitled'}</span>
            `;
            el.onclick = () => { if (this.onSelect) this.onSelect(item); };
            this.listEl.appendChild(el);
        });
    }
}
