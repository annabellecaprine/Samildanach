/**
 * Panel: Project
 * Home page / Cover page for the Setting.
 * Uses centralized State module for project metadata.
 */

import { VaultDB } from '../../core/vault.js';
import { RulesDB } from '../../core/rules-db.js';
import { FlowsDB } from '../../core/flows-db.js';
import { Exporter } from '../../core/exporter.js';
import { State } from '../../core/state.js';
import { getAllCategories } from '../../core/categories.js';
import { Toast } from '../../components/toast/index.js';
import { Tour } from '../../components/tour/index.js';

export const ProjectPanel = {
    id: 'project',
    label: 'Project',
    icon: '🏠',

    render: async (container, state) => {
        try {
            await VaultDB.init();
        } catch (e) {
            container.innerHTML = `<div class="text-muted">Vault Error: ${e.message}</div>`;
            return;
        }

        const allItems = await VaultDB.list();

        // Calculate stats
        const stats = {};
        getAllCategories().forEach(cat => {
            stats[cat.id] = allItems.filter(i => i.type === cat.id).length;
        });
        const totalRelationships = allItems.reduce((sum, i) => sum + (i.data.relationships?.length || 0), 0);

        container.innerHTML = `
            <div class="project-layout">
                <div class="project-content">
                    
                    <!-- Header -->
                    <div class="project-header flex justify-between items-center">
                        <div class="flex items-center gap-md flex-1">
                            <div class="project-icon">📖</div>
                            <input id="proj-title" type="text" value="${State.project.title}" 
                                placeholder="Setting Title" class="project-title flex-1">
                        </div>
                        <div class="project-author">
                            <input id="proj-author" type="text" value="${State.project.author}" 
                                placeholder="Author Name">
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="stats-grid">
                        ${getAllCategories().map(cat => `
                            <div class="stat-card" style="border-left-color: ${cat.color};">
                                <div class="stat-icon">${cat.icon}</div>
                                <div class="stat-value">${stats[cat.id] || 0}</div>
                                <div class="stat-label">${cat.label}s</div>
                            </div>
                        `).join('')}
                        <div class="stat-card">
                            <div class="stat-icon">🔗</div>
                            <div class="stat-value">${totalRelationships}</div>
                            <div class="stat-label">Relationships</div>
                        </div>
                    </div>

                    <!-- Project Details -->
                    <div class="project-details">
                        <h3>Project Details</h3>
                        
                        <div class="details-grid">
                            <div class="detail-field">
                                <label class="label">Version</label>
                                <input id="proj-version" type="text" value="${State.project.version}" class="input">
                            </div>
                            <div class="detail-field">
                                <label class="label">Genre</label>
                                <input id="proj-genre" type="text" value="${State.project.genre}" 
                                    placeholder="Fantasy, Sci-Fi, Horror..." class="input">
                            </div>
                        </div>
                        
                        <div class="detail-field">
                            <label class="label">Compatible Game System</label>
                            <input id="proj-system" type="text" value="${State.project.system}" 
                                placeholder="D&D 5e, Pathfinder 2e, Fate Core..." class="input">
                        </div>

                        <div class="detail-field" style="margin-top: 16px;">
                            <label class="label">Description</label>
                            <textarea id="proj-description" rows="4" 
                                placeholder="Describe your setting..." class="textarea">${State.project.description}</textarea>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions">
                        <button id="btn-export" class="action-btn">📤 Export Setting</button>
                        <button id="btn-import" class="action-btn">📥 Import Setting</button>
                    </div>
                    <input type="file" id="import-file" accept=".json" style="display:none;">
                </div>
            </div>
        `;

        // Auto-save handlers - update State
        const save = () => {
            State.updateProject({
                title: container.querySelector('#proj-title').value,
                author: container.querySelector('#proj-author').value,
                version: container.querySelector('#proj-version').value,
                genre: container.querySelector('#proj-genre').value,
                system: container.querySelector('#proj-system').value,
                description: container.querySelector('#proj-description').value
            });
        };

        container.querySelectorAll('input, textarea').forEach(el => {
            el.oninput = save;
        });



        // Export - includes State
        container.querySelector('#btn-export').onclick = async () => {
            try {
                const projectName = (State.project.title || 'samildanach').toLowerCase().replace(/\s+/g, '-');
                const json = await Exporter.toJSON();
                Exporter.download(JSON.stringify(json, null, 2), `${projectName}.json`, 'application/json');
                Toast.show('Project exported successfully', 'success');
            } catch (e) {
                Toast.show('Export failed: ' + e.message, 'error');
            }
        };

        // Import - updates State
        const fileInput = container.querySelector('#import-file');
        container.querySelector('#btn-import').onclick = () => fileInput.click();

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);

                let counts = { entries: 0, rules: 0, flows: 0 };

                if (importData.meta) {
                    State.updateProject(importData.meta);
                }

                // Import Library Entries
                if (importData.entries && Array.isArray(importData.entries)) {
                    await VaultDB.init();
                    for (const entry of importData.entries) {
                        // Check if exists? schema might differ. 
                        // VaultDB.addItem generates ID. To preserve ID we might need a lower level put, 
                        // but VaultDB doesn't expose it easily. 
                        // For now we re-add.
                        await VaultDB.addItem(entry.type, entry.data);
                    }
                    counts.entries = importData.entries.length;
                }

                // Import Grimoire Rules
                if (importData.rules && Array.isArray(importData.rules)) {
                    await RulesDB.init();
                    for (const rule of importData.rules) {
                        // We use the internal 'add' but logic inside might duplicate.
                        // Ideally we should check existence or use put with ID.
                        // For this implementation effectively merging.
                        await RulesDB.add(rule.type, rule.data);
                    }
                    counts.rules = importData.rules.length;
                }

                // Import Architect Flows
                if (importData.flows && Array.isArray(importData.flows)) {
                    await FlowsDB.init();
                    for (const flow of importData.flows) {
                        // Force ID preservation for flows is important for linking
                        // But FlowsDB.create generates ID. 
                        // We need a way to restore exact ID.
                        // Use raw DB access or update method if it allows new items.
                        // FlowsDB.update uses 'put' which can insert if key matches.
                        await FlowsDB.update(flow);
                    }
                    counts.flows = importData.flows.length;
                }

                // alert(`Imported:\n- ${counts.entries} Library Entries\n- ${counts.rules} Rules\n- ${counts.flows} Flows`);
                Toast.show(`Imported: ${counts.entries} Items, ${counts.rules} Rules, ${counts.flows} Flows`, 'success');
                setTimeout(() => location.reload(), 1500);
            } catch (err) {
                console.error(err);
                Toast.show('Import failed: ' + err.message, 'error');
            }
        };
    }
};
