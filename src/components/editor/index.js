/**
 * Component: Rich Text Editor
 * Vanilla JS WYSIWYG with Wiki-Link Support.
 */

export class RichTextEditor {
    constructor(container, initialValue = '', options = {}) {
        this.container = container;
        this.value = initialValue;
        this.onChange = null;
        this.onLinkClick = options.onLinkClick || null;
        this.getEntries = options.getEntries || (() => []);
    }

    render() {
        this.container.innerHTML = `
            <div class="rte-wrapper">
                <!-- Toolbar -->
                <div class="rte-toolbar">
                    <button data-cmd="bold" title="Bold" class="rte-btn rte-btn-bold">B</button>
                    <button data-cmd="italic" title="Italic" class="rte-btn rte-btn-italic">I</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="h2" title="Header" class="rte-btn">H2</button>
                    <button data-cmd="h3" title="Subheader" class="rte-btn">H3</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="insertUnorderedList" title="Bullet List" class="rte-btn">• List</button>
                    <div class="rte-divider"></div>
                    <button data-cmd="link" title="Insert Link [[]]" class="rte-btn">🔗</button>
                </div>

                <!-- Editable Area -->
                <div class="rte-content" contenteditable="true">
                    ${this.renderWithLinks(this.value)}
                </div>

                <!-- Autocomplete Dropdown -->
                <div class="rte-autocomplete"></div>
            </div>
        `;

        this.editor = this.container.querySelector('.rte-content');
        this.autocomplete = this.container.querySelector('.rte-autocomplete');
        this.bindEvents();
    }

    renderWithLinks(html) {
        return html.replace(/\[\[([^\]]+)\]\]/g, (match, name) => {
            return `<span class="wiki-link" data-link="${name}">[[${name}]]</span>`;
        });
    }

    extractRawText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        temp.querySelectorAll('.wiki-link').forEach(el => {
            el.replaceWith(`[[${el.dataset.link}]]`);
        });
        return temp.innerHTML;
    }

    bindEvents() {
        // Toolbar Commands
        this.container.querySelectorAll('button[data-cmd]').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                const cmd = btn.dataset.cmd;

                if (cmd === 'link') {
                    this.insertLinkPlaceholder();
                } else if (cmd === 'h2' || cmd === 'h3') {
                    document.execCommand('formatBlock', false, cmd);
                } else {
                    document.execCommand(cmd, false, null);
                }
                this.editor.focus();
            };
        });

        // Input Handler
        this.editor.oninput = () => {
            this.checkForAutocomplete();
            this.value = this.extractRawText(this.editor.innerHTML);
            if (this.onChange) this.onChange(this.value);
        };

        // Click Handler for Wiki Links
        this.editor.onclick = (e) => {
            if (e.target.classList.contains('wiki-link')) {
                const linkName = e.target.dataset.link;
                if (this.onLinkClick) this.onLinkClick(linkName);
            }
        };

        // Keyboard for Autocomplete
        this.editor.onkeydown = (e) => {
            if (this.autocomplete.style.display !== 'none') {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigateAutocomplete(e.key === 'ArrowDown' ? 1 : -1);
                } else if (e.key === 'Enter' || e.key === 'Tab') {
                    const selected = this.autocomplete.querySelector('.selected');
                    if (selected) {
                        e.preventDefault();
                        this.selectAutocompleteItem(selected.dataset.name);
                    }
                } else if (e.key === 'Escape') {
                    this.hideAutocomplete();
                }
            }
        };

        this.editor.onblur = () => {
            setTimeout(() => this.hideAutocomplete(), 150);
        };
    }

    insertLinkPlaceholder() {
        document.execCommand('insertText', false, '[[]]');
        const sel = window.getSelection();
        if (sel.rangeCount) {
            const range = sel.getRangeAt(0);
            range.setStart(range.startContainer, range.startOffset - 2);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    checkForAutocomplete() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent.substring(0, range.startOffset);
        const match = text.match(/\[\[([^\]]*?)$/);

        if (match) {
            const query = match[1].toLowerCase();
            const entries = this.getEntries().filter(e =>
                (e.data.name || '').toLowerCase().includes(query)
            ).slice(0, 8);

            if (entries.length > 0) {
                this.showAutocomplete(entries);
            } else {
                this.hideAutocomplete();
            }
        } else {
            this.hideAutocomplete();
        }
    }

    showAutocomplete(entries) {
        this.autocomplete.innerHTML = '';
        entries.forEach((entry, i) => {
            const item = document.createElement('div');
            item.dataset.name = entry.data.name;
            item.className = 'rte-autocomplete-item' + (i === 0 ? ' selected' : '');
            item.innerText = entry.data.name || 'Untitled';
            item.onmousedown = (e) => {
                e.preventDefault();
                this.selectAutocompleteItem(entry.data.name);
            };
            this.autocomplete.appendChild(item);
        });

        this.autocomplete.style.display = 'block';
        this.autocomplete.style.left = '16px';
        this.autocomplete.style.bottom = '16px';
    }

    hideAutocomplete() {
        this.autocomplete.style.display = 'none';
    }

    navigateAutocomplete(dir) {
        const items = Array.from(this.autocomplete.children);
        const current = items.findIndex(i => i.classList.contains('selected'));
        items[current]?.classList.remove('selected');

        const next = Math.max(0, Math.min(items.length - 1, current + dir));
        items[next]?.classList.add('selected');
    }

    selectAutocompleteItem(name) {
        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const textNode = range.startContainer;
        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent;
        const before = text.substring(0, range.startOffset);
        const match = before.match(/\[\[([^\]]*?)$/);

        if (match) {
            const start = before.lastIndexOf('[[');
            const after = text.substring(range.startOffset);
            const closeBracket = after.indexOf(']]');
            const afterClose = closeBracket >= 0 ? after.substring(closeBracket + 2) : after;

            const linkSpan = document.createElement('span');
            linkSpan.className = 'wiki-link';
            linkSpan.dataset.link = name;
            linkSpan.innerText = `[[${name}]]`;

            const beforeText = document.createTextNode(text.substring(0, start));
            const afterText = document.createTextNode(' ' + afterClose);

            const parent = textNode.parentNode;
            parent.insertBefore(beforeText, textNode);
            parent.insertBefore(linkSpan, textNode);
            parent.insertBefore(afterText, textNode);
            parent.removeChild(textNode);

            const newRange = document.createRange();
            newRange.setStartAfter(linkSpan);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
        }

        this.hideAutocomplete();
        this.value = this.extractRawText(this.editor.innerHTML);
        if (this.onChange) this.onChange(this.value);
    }

    getValue() {
        return this.extractRawText(this.editor.innerHTML);
    }

    setValue(html) {
        this.value = html;
        if (this.editor) this.editor.innerHTML = this.renderWithLinks(html);
    }
}
