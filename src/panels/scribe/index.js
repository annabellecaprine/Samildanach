/**
 * Panel: The Scribe
 * AI-assisted world-building chat with Library integration.
 */

import { LLM } from '../../core/llm.js';
import { VaultDB } from '../../core/vault.js';
import { getAllCategories } from '../../core/categories.js';
import { generateId } from '../../core/utils.js';
import { Utils } from '../../core/utils.js';
import { Modal } from '../../components/modal/index.js';
import { Toast } from '../../components/toast/index.js';
import { ArchivesDB, DOC_STATUS } from '../../core/archives-db.js';
import { embedQuery } from '../../core/query-embedder.js';
import { findSimilar, flattenChunks } from '../../core/vector-search.js';

const STORAGE_KEY = 'samildanach_scribe_state';

const MODES = [
    { id: 'brainstorm', label: '💡 Brainstorm', desc: 'Generate ideas and explore concepts' },
    { id: 'expand', label: '📝 Expand', desc: 'Develop and detail existing entries' },
    { id: 'critique', label: '🔍 Critique', desc: 'Get feedback and suggestions' }
];

const TEMPLATES = {
    brainstorm: [
        { label: 'Character concept', prompt: 'Help me brainstorm a character who...' },
        { label: 'Location idea', prompt: 'I need a unique location for...' },
        { label: 'Faction conflict', prompt: 'Create tension between factions by...' },
        { label: 'Plot hook', prompt: 'Generate a compelling plot hook involving...' }
    ],
    expand: [
        { label: 'Add history', prompt: 'Expand the backstory and history of...' },
        { label: 'Describe appearance', prompt: 'Describe in vivid detail how this looks:' },
        { label: 'Add relationships', prompt: 'How might this connect to other elements in my world?' },
        { label: 'Cultural details', prompt: 'What customs, traditions, or beliefs would exist here?' }
    ],
    critique: [
        { label: 'Check consistency', prompt: 'Review this for internal consistency:' },
        { label: 'Strengthen concept', prompt: 'How can I make this more unique or compelling?' },
        { label: 'Find gaps', prompt: 'What questions or gaps exist in this concept?' },
        { label: 'Balance check', prompt: 'Is this balanced for gameplay? What adjustments?' }
    ]
};

export const ScribePanel = {
    id: 'scribe',
    label: 'Scribe',
    icon: '✍️',

    render: async (container) => {
        // Load state
        let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (!state.mode) state.mode = 'brainstorm';
        if (!state.history) state.history = [];
        if (!state.selectedEntries) state.selectedEntries = [];
        if (!state.sessions) state.sessions = {};
        if (!state.selectedArchives) state.selectedArchives = [];

        const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

        // Load Library entries
        await VaultDB.init();
        const entries = await VaultDB.list();
        const categories = getAllCategories();

        // Load Archives
        await ArchivesDB.init();
        const archiveDocs = await ArchivesDB.listDocuments();
        const readyDocs = archiveDocs.filter(d => d.status === DOC_STATUS.READY);

        container.innerHTML = `
            <div class="scribe-layout">
                <!-- Left: Context Panel -->
                <div class="scribe-sidebar">
                    <div class="sidebar-header">
                        <strong>✍️ The Scribe</strong>
                    </div>

                    <!-- Mode Selection -->
                    <div class="sidebar-section">
                        <div class="section-label">Mode</div>
                        <div class="mode-buttons">
                            ${MODES.map(m => `
                                <button class="mode-btn ${state.mode === m.id ? 'active' : ''}" data-mode="${m.id}" title="${m.desc}">
                                    ${m.label}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Library Context -->
                    <div class="sidebar-section flex-1">
                        <div class="section-label">Library Context</div>
                        <div class="entry-list">
                            ${categories.map(cat => {
            const catEntries = entries.filter(e => e.type === cat.id);
            if (catEntries.length === 0) return '';
            return `
                                    <div class="entry-category">
                                        <div class="category-label">${cat.icon} ${cat.label}</div>
                                        ${catEntries.map(e => `
                                            <label class="entry-checkbox">
                                                <input type="checkbox" 
                                                    value="${e.id}" 
                                                    ${state.selectedEntries.includes(e.id) ? 'checked' : ''}>
                                                <span>${Utils.escapeHtml(e.data.name || 'Untitled')}</span>
                                            </label>
                                        `).join('')}
                                    </div>
                                `;
        }).join('')}
                            ${entries.length === 0 ? '<div class="empty-hint">No Library entries yet</div>' : ''}
                        </div>
                    </div>

                    <!-- Archives Context -->
                    <div class="sidebar-section">
                        <div class="section-label">Archives Context</div>
                        <div class="archive-list">
                            ${readyDocs.length === 0 ? '<div class="empty-hint">Upload documents in Archives panel</div>' : ''}
                            ${readyDocs.map(doc => `
                                <label class="entry-checkbox archive-checkbox">
                                    <input type="checkbox" 
                                        data-archive-id="${doc.id}" 
                                        ${state.selectedArchives.includes(doc.id) ? 'checked' : ''}>
                                    <span>🏛️ ${Utils.escapeHtml(doc.filename)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Session Controls -->
                    <div class="sidebar-footer">
                        <select id="session-select" class="input text-sm">
                            <option value="">-- Sessions --</option>
                            ${Object.keys(state.sessions).map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                        <button id="btn-save-session" class="btn btn-ghost btn-sm" title="Save Session">💾</button>
                        <button id="btn-load-session" class="btn btn-ghost btn-sm" title="Load Session">📂</button>
                    </div>
                </div>

                <!-- Right: Chat Panel -->
                <div class="scribe-main">
                    <div id="chat-log" class="chat-log"></div>

                    <div class="chat-footer">
                        <div class="chat-controls">
                            <select id="template-select" class="input text-sm">
                                <option value="">📝 Templates...</option>
                            </select>
                            <div class="flex-1"></div>
                            <button id="btn-clear" class="btn btn-ghost btn-sm">🗑️ Clear</button>
                        </div>
                        <div class="chat-input-row">
                            <textarea id="chat-input" class="input" rows="3" placeholder="Ask The Scribe for help with your world..."></textarea>
                            <button id="btn-send" class="btn btn-primary">Send</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Elements
        const chatLog = container.querySelector('#chat-log');
        const chatInput = container.querySelector('#chat-input');
        const sendBtn = container.querySelector('#btn-send');
        const templateSelect = container.querySelector('#template-select');
        const sessionSelect = container.querySelector('#session-select');

        // Refresh templates
        function refreshTemplates() {
            const templates = TEMPLATES[state.mode] || [];
            templateSelect.innerHTML = '<option value="">📝 Templates...</option>' +
                templates.map((t, i) => `<option value="${i}">${t.label}</option>`).join('');
        }
        refreshTemplates();

        // Template selection
        templateSelect.onchange = () => {
            const idx = parseInt(templateSelect.value);
            if (!isNaN(idx)) {
                const templates = TEMPLATES[state.mode] || [];
                if (templates[idx]) {
                    chatInput.value = templates[idx].prompt;
                    chatInput.focus();
                }
            }
            templateSelect.value = '';
        };

        // Mode buttons
        container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.onclick = () => {
                state.mode = btn.dataset.mode;
                container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                refreshTemplates();
                saveState();
            };
        });

        // Entry checkboxes
        container.querySelectorAll('.entry-checkbox input:not(#archives-toggle)').forEach(cb => {
            cb.onchange = () => {
                const id = cb.value;
                if (cb.checked) {
                    if (!state.selectedEntries.includes(id)) {
                        state.selectedEntries.push(id);
                    }
                } else {
                    state.selectedEntries = state.selectedEntries.filter(e => e !== id);
                }
                saveState();
            };
        });

        // Archives document checkboxes
        container.querySelectorAll('.archive-checkbox input').forEach(cb => {
            cb.onchange = () => {
                const id = cb.dataset.archiveId;
                if (cb.checked) {
                    if (!state.selectedArchives.includes(id)) {
                        state.selectedArchives.push(id);
                    }
                } else {
                    state.selectedArchives = state.selectedArchives.filter(a => a !== id);
                }
                saveState();
            };
        });

        // Render chat
        function renderChat() {
            if (state.history.length === 0) {
                chatLog.innerHTML = `
                    <div class="chat-empty">
                        <div class="empty-icon">✍️</div>
                        <div class="empty-title">The Scribe</div>
                        <div class="empty-hint">Your AI world-building assistant. Select Library entries for context, then ask for help.</div>
                    </div>
                `;
                return;
            }

            chatLog.innerHTML = state.history.map(msg => `
                <div class="chat-bubble ${msg.role}">
                    <div class="bubble-content">${Utils.escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
                    <div class="bubble-meta">
                        <span>${msg.role === 'user' ? 'You' : '✍️ Scribe'}</span>
                        <button class="btn-copy" data-content="${encodeURIComponent(msg.content)}" title="Copy">📋</button>
                    </div>
                </div>
            `).join('');

            // Copy buttons
            chatLog.querySelectorAll('.btn-copy').forEach(btn => {
                btn.onclick = () => {
                    navigator.clipboard.writeText(decodeURIComponent(btn.dataset.content));
                };
            });

            chatLog.scrollTop = chatLog.scrollHeight;
        }
        renderChat();

        // Generate system prompt
        function generateSystemPrompt() {
            const modeConfig = MODES.find(m => m.id === state.mode);
            let prompt = `You are The Scribe, an expert world-building assistant for tabletop RPG settings. `;

            if (state.mode === 'brainstorm') {
                prompt += `Help the user generate creative ideas, explore concepts, and brainstorm possibilities. Be imaginative and offer multiple options.`;
            } else if (state.mode === 'expand') {
                prompt += `Help the user develop and expand existing ideas with rich detail. Add depth, history, and connections.`;
            } else if (state.mode === 'critique') {
                prompt += `Provide constructive feedback on the user's ideas. Identify strengths, weaknesses, inconsistencies, and suggest improvements.`;
            }

            // Add selected entries as context
            if (state.selectedEntries.length > 0) {
                const selectedData = state.selectedEntries
                    .map(id => entries.find(e => e.id === id))
                    .filter(Boolean);

                if (selectedData.length > 0) {
                    prompt += `\n\n[WORLD CONTEXT - The user has selected these entries from their world Bible:]\n`;
                    selectedData.forEach(entry => {
                        const cat = categories.find(c => c.id === entry.type);
                        prompt += `\n[${cat?.label || entry.type}] ${entry.data.name || 'Untitled'}`;

                        // Add key fields
                        if (entry.data.description) {
                            const plainDesc = entry.data.description.replace(/<[^>]+>/g, '').substring(0, 300);
                            prompt += `: ${plainDesc}`;
                        }

                        // Add category-specific fields
                        if (cat?.fields) {
                            cat.fields.forEach(f => {
                                if (entry.data[f.key]) {
                                    prompt += ` | ${f.label}: ${entry.data[f.key]}`;
                                }
                            });
                        }

                        // Add relationships
                        if (entry.data.relationships && entry.data.relationships.length > 0) {
                            prompt += `\n  Relationships:`;
                            entry.data.relationships.forEach(rel => {
                                const targetEntry = entries.find(e => e.id === rel.targetId);
                                const targetName = targetEntry?.data.name || '(Unknown)';
                                const relLabel = rel.type || 'related to';
                                prompt += `\n    - ${relLabel}: ${targetName}`;
                                if (rel.notes) {
                                    prompt += ` (${rel.notes})`;
                                }
                            });
                        }
                    });
                    prompt += `\n[END CONTEXT]`;
                }
            }

            return prompt;
        }

        // Send message
        async function sendMessage() {
            const text = chatInput.value.trim();
            if (!text) return;

            const userMsg = {
                id: generateId(),
                role: 'user',
                content: text,
                timestamp: new Date().toISOString()
            };

            state.history.push(userMsg);
            chatInput.value = '';
            renderChat();
            saveState();

            sendBtn.disabled = true;
            sendBtn.textContent = 'Thinking...';

            try {
                const activeConfig = LLM.getActiveConfig();
                if (!activeConfig) {
                    throw new Error('No API configuration. Go to Settings to add one.');
                }

                let systemPrompt = generateSystemPrompt();

                // Archives vector search
                if (state.selectedArchives.length > 0) {
                    try {
                        sendBtn.textContent = 'Searching archives...';

                        // Fetch fresh documents at query time, filtered by selection
                        const freshDocs = await ArchivesDB.listDocuments();
                        const selectedDocs = freshDocs.filter(d =>
                            d.status === DOC_STATUS.READY &&
                            state.selectedArchives.includes(d.id)
                        );
                        console.log('[Scribe] Selected archive docs:', selectedDocs.length);

                        if (selectedDocs.length > 0) {
                            const queryVector = await embedQuery(text);
                            const allChunks = flattenChunks(selectedDocs);
                            console.log('[Scribe] Total chunks to search:', allChunks.length);

                            const matches = findSimilar(queryVector, allChunks, 3);
                            console.log('[Scribe] Matches found:', matches.length, matches.map(m => ({ doc: m.docName, score: m.score })));

                            if (matches.length > 0) {
                                systemPrompt += `\n\n[ARCHIVE CONTEXT - Relevant excerpts from uploaded documents:]\n`;
                                matches.forEach((m, i) => {
                                    systemPrompt += `\n[${m.docName}] (relevance: ${(m.score * 100).toFixed(0)}%)\n${m.text.substring(0, 500)}${m.text.length > 500 ? '...' : ''}\n`;
                                });
                                systemPrompt += `\n[END ARCHIVE CONTEXT]`;
                            }
                        }
                        sendBtn.textContent = 'Thinking...';
                    } catch (archiveErr) {
                        console.warn('[Scribe] Archives search error:', archiveErr);
                    }
                }

                // Prepare history for LLM
                const historyForLLM = state.history.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    content: m.content
                }));

                // Limit context window (last 20 messages)
                const contextWindow = historyForLLM.slice(-20);

                const response = await LLM.generate(systemPrompt, contextWindow);

                const aiMsg = {
                    id: generateId(),
                    role: 'model',
                    content: response,
                    timestamp: new Date().toISOString()
                };

                state.history.push(aiMsg);
                saveState();
                renderChat();

            } catch (err) {
                console.error('[Scribe]', err);

                state.history.push({
                    id: generateId(),
                    role: 'model',
                    content: `[Error: ${err.message}]`,
                    timestamp: new Date().toISOString()
                });
                renderChat();
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send';
            }
        }

        sendBtn.onclick = sendMessage;
        chatInput.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        };

        // Clear chat
        container.querySelector('#btn-clear').onclick = async () => {
            const confirmed = await Modal.confirm('Clear Chat', 'Clear all messages?');
            if (confirmed) {
                state.history = [];
                saveState();
                renderChat();
                Toast.show('Chat cleared', 'success');
            }
        };

        // Save session
        container.querySelector('#btn-save-session').onclick = async () => {
            const name = await Modal.prompt('Session name:', `Session ${Object.keys(state.sessions).length + 1}`);
            if (!name) return;

            state.sessions[name] = {
                history: [...state.history],
                mode: state.mode,
                selectedEntries: [...state.selectedEntries],
                savedAt: new Date().toISOString()
            };
            saveState();

            // Refresh session select
            sessionSelect.innerHTML = '<option value="">-- Sessions --</option>' +
                Object.keys(state.sessions).map(s => `<option value="${s}">${s}</option>`).join('');

            Toast.show('Session saved', 'success');
        };

        // Load session
        container.querySelector('#btn-load-session').onclick = () => {
            const name = sessionSelect.value;
            if (!name || !state.sessions[name]) return;

            const session = state.sessions[name];
            state.history = [...session.history];
            state.mode = session.mode;
            state.selectedEntries = [...session.selectedEntries];

            saveState();
            ScribePanel.render(container);
        };
    }
};
