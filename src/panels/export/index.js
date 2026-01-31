/**
 * Panel: Export
 * Export project data in various formats.
 */

import { Exporter } from '../../core/exporter.js';
import { State } from '../../core/state.js';

export const ExportPanel = {
    id: 'export',
    label: 'Export',
    icon: '📤',

    render: (container, state) => {
        container.innerHTML = `
            <div class="export-layout">
                <div class="export-content">
                    <h1 class="export-title">Export Project</h1>
                    <p class="export-description">
                        Export your world-building data in various formats.
                    </p>

                    <!-- Format Selection -->
                    <div class="export-section">
                        <h2 class="section-title">Format</h2>
                        <div class="format-grid">
                            <button class="format-btn active" data-format="json">
                                <span class="format-icon">📦</span>
                                <span class="format-name">JSON</span>
                                <span class="format-desc">Complete data backup</span>
                            </button>
                            <button class="format-btn" data-format="markdown">
                                <span class="format-icon">📝</span>
                                <span class="format-name">Markdown</span>
                                <span class="format-desc">Human-readable text</span>
                            </button>
                            <button class="format-btn" data-format="html">
                                <span class="format-icon">🌐</span>
                                <span class="format-name">HTML</span>
                                <span class="format-desc">Styled web page</span>
                            </button>
                            <button class="format-btn" data-format="pdf">
                                <span class="format-icon">📄</span>
                                <span class="format-name">PDF</span>
                                <span class="format-desc">Print-ready document</span>
                            </button>
                        </div>
                    </div>

                    <!-- Preview -->
                    <div class="export-section">
                        <h2 class="section-title">Preview</h2>
                        <div id="export-preview" class="export-preview">
                            <div class="preview-loading">Select a format above</div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="export-actions">
                        <button id="btn-export" class="btn btn-primary btn-lg">Download</button>
                    </div>
                </div>
            </div>
        `;

        let selectedFormat = 'json';
        const previewEl = container.querySelector('#export-preview');
        const exportBtn = container.querySelector('#btn-export');
        const formatBtns = container.querySelectorAll('.format-btn');

        // Format selection
        formatBtns.forEach(btn => {
            btn.onclick = async () => {
                formatBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedFormat = btn.dataset.format;
                await updatePreview();
            };
        });

        async function updatePreview() {
            previewEl.innerHTML = '<div class="preview-loading">Generating preview...</div>';

            try {
                let preview = '';

                switch (selectedFormat) {
                    case 'json':
                        const json = await Exporter.toJSON();
                        preview = `<pre class="preview-code">${JSON.stringify(json, null, 2).substring(0, 2000)}${JSON.stringify(json, null, 2).length > 2000 ? '\n...' : ''}</pre>`;
                        break;
                    case 'markdown':
                        const md = await Exporter.toMarkdown();
                        preview = `<pre class="preview-code">${escapeHtml(md.substring(0, 2000))}${md.length > 2000 ? '\n...' : ''}</pre>`;
                        break;
                    case 'html':
                        preview = `<div class="preview-note">Full HTML document will be downloaded.</div><pre class="preview-code">${escapeHtml((await Exporter.toHTML()).substring(0, 1500))}...</pre>`;
                        break;
                    case 'pdf':
                        preview = `<div class="preview-note">PDF will open in a print dialog.<br>Use "Save as PDF" in your browser's print options.</div>`;
                        break;
                }

                previewEl.innerHTML = preview;
            } catch (e) {
                previewEl.innerHTML = `<div class="preview-error">Error: ${e.message}</div>`;
            }
        }

        // Export action
        exportBtn.onclick = async () => {
            exportBtn.disabled = true;
            exportBtn.innerText = 'Exporting...';

            try {
                const projectName = (State.project.title || 'samildanach').toLowerCase().replace(/\s+/g, '-');

                switch (selectedFormat) {
                    case 'json':
                        const json = await Exporter.toJSON();
                        Exporter.download(JSON.stringify(json, null, 2), `${projectName}.json`, 'application/json');
                        break;
                    case 'markdown':
                        const md = await Exporter.toMarkdown();
                        Exporter.download(md, `${projectName}.md`, 'text/markdown');
                        break;
                    case 'html':
                        const html = await Exporter.toHTML();
                        Exporter.download(html, `${projectName}.html`, 'text/html');
                        break;
                    case 'pdf':
                        await Exporter.printToPDF();
                        break;
                }
            } catch (e) {
                alert('Export failed: ' + e.message);
            }

            exportBtn.disabled = false;
            exportBtn.innerText = 'Download';
        };

        // Initial preview
        updatePreview();

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    }
};
