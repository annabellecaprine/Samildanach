/**
 * Samildánach - Main Entry Point
 * Bootstraps the Core UI and registers default panels.
 */

import { UI } from './core/ui.js';
import { State } from './core/state.js';
import { Toast } from './components/toast/index.js';
import { Tour } from './components/tour/index.js';

// Dev: Archives Test (remove after validation)
import { testArchives } from './core/dev-archives-test.js';
window.testArchives = testArchives;

// Import Panels
import { ProjectPanel } from './panels/project/index.js';
import { LibraryPanel } from './panels/library/index.js';
import { GrimoirePanel } from './panels/grimoire/index.js';
import { GraphPanel } from './panels/graph/index.js';
import { ArchitectPanel } from './panels/architect/index.js';
import { LaboratoryPanel } from './panels/laboratory/index.js';
import { ScribePanel } from './panels/scribe/index.js';
import { ExportPanel } from './panels/export/index.js';
import { SettingsPanel } from './panels/settings/index.js';
import { ArchivesPanel } from './panels/archives/index.js';
import { ClassesPanel } from './panels/classes/index.js';

// Divider marker for sidebar
const Divider = { divider: true };

async function init() {
    console.log(`%c Samildánach v${State.project.version} `, 'background: #222; color: #bada55');

    // Register Panels (order matters for sidebar)
    // --- Content ---
    UI.registerPanel(ProjectPanel.id, ProjectPanel);
    UI.registerPanel(LibraryPanel.id, LibraryPanel);
    UI.registerPanel(GrimoirePanel.id, GrimoirePanel);
    UI.registerPanel(ClassesPanel.id, ClassesPanel);

    // --- Divider ---
    UI.registerPanel('divider1', Divider);

    // --- Tools ---
    UI.registerPanel(GraphPanel.id, GraphPanel);
    UI.registerPanel(ArchitectPanel.id, ArchitectPanel);
    UI.registerPanel(LaboratoryPanel.id, LaboratoryPanel);

    // --- Divider ---
    UI.registerPanel('divider2', Divider);

    // --- AI ---
    UI.registerPanel(ScribePanel.id, ScribePanel);
    UI.registerPanel(ArchivesPanel.id, ArchivesPanel);

    // --- Divider ---
    UI.registerPanel('divider3', Divider);

    // --- System ---
    UI.registerPanel(ExportPanel.id, ExportPanel);
    UI.registerPanel(SettingsPanel.id, SettingsPanel);

    // Initialize UI (will restore saved panel or fallback to default)
    UI.init();

    // If no saved panel, default to Project (Home)
    if (!UI.activePanelId) {
        UI.switchPanel(ProjectPanel.id);
    }

    // Bind Global Tour Button
    const tourBtn = document.getElementById('global-tour-btn');
    if (tourBtn) {
        tourBtn.onclick = () => Tour.start('getting-started');
    }
}

// Boot
window.addEventListener('DOMContentLoaded', init);
