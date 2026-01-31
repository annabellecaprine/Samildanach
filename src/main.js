/**
 * Samildánach - Main Entry Point
 * Bootstraps the Core UI and registers default panels.
 */

import { UI } from './core/ui.js';
import { State } from './core/state.js';

// Import Panels
import { ProjectPanel } from './panels/project/index.js';
import { LaboratoryPanel } from './panels/laboratory/index.js';
import { LibraryPanel } from './panels/library/index.js';
import { ArchitectPanel } from './panels/architect/index.js';
import { GraphPanel } from './panels/graph/index.js';
import { ExportPanel } from './panels/export/index.js';
import { ScribePanel } from './panels/scribe/index.js';
import { SettingsPanel } from './panels/settings/index.js';

async function init() {
    console.log(`%c Samildánach v${State.project.version} `, 'background: #222; color: #bada55');

    // Register Panels (order matters for sidebar)
    UI.registerPanel(ProjectPanel.id, ProjectPanel);
    UI.registerPanel(LibraryPanel.id, LibraryPanel);
    UI.registerPanel(GraphPanel.id, GraphPanel);
    UI.registerPanel(ArchitectPanel.id, ArchitectPanel);
    UI.registerPanel(LaboratoryPanel.id, LaboratoryPanel);
    UI.registerPanel(ExportPanel.id, ExportPanel);
    UI.registerPanel(ScribePanel.id, ScribePanel);
    UI.registerPanel(SettingsPanel.id, SettingsPanel);

    // Initialize UI (will restore saved panel or fallback to default)
    UI.init();

    // If no saved panel, default to Project (Home)
    if (!UI.activePanelId) {
        UI.switchPanel(ProjectPanel.id);
    }
}

// Boot
window.addEventListener('DOMContentLoaded', init);
