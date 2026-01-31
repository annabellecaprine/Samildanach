/**
 * Core Exporter
 * Handles exporting project data in various formats.
 * @module Core/Exporter
 */

import { VaultDB } from './vault.js';
import { State } from './state.js';
import { getCategoryById, getAllCategories } from './categories.js';
import { getRelationshipById } from './relationships.js';

export const Exporter = {
    /**
     * Export as JSON bundle (complete data)
     * @returns {Object} Export data object
     */
    async toJSON() {
        await VaultDB.init();
        const entries = await VaultDB.list();

        return {
            meta: { ...State.project },
            entries: entries,
            exportedAt: new Date().toISOString(),
            version: '1.0',
            format: 'samildanach-json'
        };
    },

    /**
     * Export as Markdown document
     * @param {Object} options - { includeRelationships: boolean }
     * @returns {string} Markdown string
     */
    async toMarkdown(options = {}) {
        const { includeRelationships = true } = options;
        await VaultDB.init();
        const entries = await VaultDB.list();

        let md = '';

        // Title page
        md += `# ${State.project.title || 'Untitled Setting'}\n\n`;
        if (State.project.author) md += `**Author:** ${State.project.author}\n\n`;
        if (State.project.version) md += `**Version:** ${State.project.version}\n\n`;
        if (State.project.genre) md += `**Genre:** ${State.project.genre}\n\n`;
        if (State.project.system) md += `**System:** ${State.project.system}\n\n`;
        if (State.project.description) {
            md += `---\n\n${State.project.description}\n\n`;
        }
        md += `---\n\n`;

        // Group by category
        const categories = getAllCategories();
        for (const cat of categories) {
            const catEntries = entries.filter(e => e.type === cat.id);
            if (catEntries.length === 0) continue;

            md += `## ${cat.icon} ${cat.label}s\n\n`;

            for (const entry of catEntries) {
                md += `### ${entry.data.name || 'Untitled'}\n\n`;

                // Metadata fields
                for (const field of cat.fields) {
                    const value = entry.data[field.key];
                    if (value) {
                        md += `**${field.label}:** ${value}\n\n`;
                    }
                }

                // Description (strip HTML for markdown)
                if (entry.data.description) {
                    const plainText = this._stripHtml(entry.data.description);
                    md += `${plainText}\n\n`;
                }

                // Relationships
                if (includeRelationships && entry.data.relationships?.length > 0) {
                    md += `**Relationships:**\n`;
                    for (const rel of entry.data.relationships) {
                        const relType = getRelationshipById(rel.type);
                        const target = entries.find(e => e.id === rel.targetId);
                        const targetName = target?.data.name || '(Unknown)';
                        md += `- ${relType.icon} ${relType.label}: ${targetName}\n`;
                    }
                    md += '\n';
                }

                md += `---\n\n`;
            }
        }

        // Footer
        md += `\n---\n*Exported from Samildánach on ${new Date().toLocaleDateString()}*\n`;

        return md;
    },

    /**
     * Export as styled HTML document
     * @returns {string} HTML string
     */
    async toHTML() {
        const markdown = await this.toMarkdown();

        // Simple markdown to HTML conversion
        let html = markdown
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>')
            .replace(/^---$/gm, '<hr>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${State.project.title || 'Samildánach Export'}</title>
    <style>
        :root {
            --bg: #1a1a2e;
            --text: #e0e0e0;
            --accent: #7c3aed;
            --border: #333;
        }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
        }
        h1 { color: var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
        h2 { color: var(--accent); margin-top: 40px; }
        h3 { margin-top: 30px; }
        hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        ul { padding-left: 20px; }
        li { margin: 4px 0; }
        strong { color: #fff; }
        @media print {
            body { background: white; color: black; }
            h1, h2, h3, strong { color: black; }
        }
    </style>
</head>
<body>
    <p>${html}</p>
</body>
</html>`;
    },

    /**
     * Trigger browser print dialog (for PDF)
     */
    async printToPDF() {
        const html = await this.toHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
    },

    /**
     * Download as file
     * @param {string} content - File content
     * @param {string} filename - Download filename
     * @param {string} mimeType - MIME type
     */
    download(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Strip HTML tags for plain text
     * @private
     */
    _stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        // Convert wiki links
        temp.querySelectorAll('.wiki-link').forEach(el => {
            el.replaceWith(el.dataset.link || el.textContent);
        });
        return temp.textContent || temp.innerText || '';
    }
};
