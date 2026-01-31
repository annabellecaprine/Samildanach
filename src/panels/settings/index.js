/**
 * Panel: Settings
 * API configuration management for LLM providers.
 */

import { LLM, PROVIDER_PRESETS } from '../../core/llm.js';
import { generateId } from '../../core/utils.js';
import { Modal } from '../../components/modal/index.js';
import { Toast } from '../../components/toast/index.js';

export const SettingsPanel = {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',

    render: (container, state) => {
        const configs = LLM.getConfigs();
        const activeConfig = LLM.getActiveConfig();

        container.innerHTML = `
            <div class="settings-layout">
                <div class="settings-content">
                    <h1 class="settings-title">⚙️ Settings</h1>

                    <!-- API Configurations -->
                    <div class="settings-section">
                        <div class="section-header">
                            <h2 class="section-title">API Configurations</h2>
                            <button id="btn-add-config" class="btn btn-primary btn-sm">+ Add</button>
                        </div>

                        <div id="configs-list" class="configs-list">
                            ${configs.length === 0 ? `
                                <div class="empty-state">
                                    <div class="empty-icon">🔑</div>
                                    <div class="empty-text">No API configurations yet</div>
                                    <div class="empty-hint">Add a configuration to enable AI features</div>
                                </div>
                            ` : configs.map(cfg => `
                                <div class="config-card ${cfg.id === activeConfig?.id ? 'active' : ''}" data-id="${cfg.id}">
                                    <div class="config-info">
                                        <div class="config-name">${Utils.escapeHtml(cfg.name || 'Unnamed')}</div>
                                        <div class="config-provider">${PROVIDER_PRESETS.find(p => p.id === cfg.provider)?.label || Utils.escapeHtml(cfg.provider)} • ${Utils.escapeHtml(cfg.model)}</div>
                                    </div>
                                    <div class="config-actions">
                                        <button class="btn btn-ghost btn-sm btn-activate" title="Set Active">✓</button>
                                        <button class="btn btn-ghost btn-sm btn-edit" title="Edit">✏️</button>
                                        <button class="btn btn-ghost btn-sm btn-delete" title="Delete">🗑️</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Editor Modal (hidden) -->
                    <div id="config-editor" class="config-editor hidden">
                        <div class="editor-content">
                            <h3 class="editor-title">Configuration</h3>
                            
                            <div class="field-group">
                                <label class="field-label">Name</label>
                                <input type="text" id="cfg-name" class="input" placeholder="My API Key">
                            </div>

                            <div class="field-group">
                                <label class="field-label">Provider</label>
                                <select id="cfg-provider" class="input">
                                    ${PROVIDER_PRESETS.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
                                </select>
                            </div>

                            <div class="field-group">
                                <label class="field-label">Model</label>
                                <select id="cfg-model" class="input"></select>
                            </div>

                            <div class="field-group" id="field-apikey">
                                <label class="field-label">API Key</label>
                                <input type="password" id="cfg-apikey" class="input" placeholder="sk-...">
                            </div>

                            <div class="field-group hidden" id="field-baseurl">
                                <label class="field-label">Base URL</label>
                                <input type="text" id="cfg-baseurl" class="input" placeholder="https://api.example.com/v1">
                            </div>

                            <div class="editor-actions">
                                <button id="btn-test-config" class="btn btn-secondary">Test Connection</button>
                                <div class="flex-1"></div>
                                <button id="btn-cancel-config" class="btn btn-ghost">Cancel</button>
                                <button id="btn-save-config" class="btn btn-primary">Save</button>
                            </div>

                            <div id="test-result" class="test-result"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Elements
        const configsList = container.querySelector('#configs-list');
        const editor = container.querySelector('#config-editor');
        const providerSelect = container.querySelector('#cfg-provider');
        const modelSelect = container.querySelector('#cfg-model');
        const baseUrlField = container.querySelector('#field-baseurl');
        const apiKeyField = container.querySelector('#field-apikey');
        const testResult = container.querySelector('#test-result');

        let editingId = null;

        // Update model options based on provider
        function updateModels() {
            const provider = providerSelect.value;
            const preset = PROVIDER_PRESETS.find(p => p.id === provider);
            modelSelect.innerHTML = preset.models.map(m => `<option value="${m}">${m}</option>`).join('');

            // Show/hide baseUrl field
            baseUrlField.style.display = ['kobold', 'custom'].includes(provider) ? 'block' : 'none';

            // Hide API key for Kobold
            apiKeyField.style.display = provider === 'kobold' ? 'none' : 'block';
        }

        providerSelect.onchange = updateModels;
        updateModels();

        // Open editor
        function openEditor(config = null) {
            editingId = config?.id || null;

            container.querySelector('#cfg-name').value = config?.name || '';
            providerSelect.value = config?.provider || 'gemini';
            updateModels();
            modelSelect.value = config?.model || modelSelect.options[0]?.value || '';
            container.querySelector('#cfg-apikey').value = config?.apiKey || '';
            container.querySelector('#cfg-baseurl').value = config?.baseUrl || '';

            testResult.innerHTML = '';
            editor.style.display = 'flex';
        }

        function closeEditor() {
            editor.style.display = 'none';
            editingId = null;
        }

        // Add new config
        container.querySelector('#btn-add-config').onclick = () => openEditor();

        // Cancel
        container.querySelector('#btn-cancel-config').onclick = closeEditor;

        // Save
        container.querySelector('#btn-save-config').onclick = () => {
            const config = {
                id: editingId || generateId(),
                name: container.querySelector('#cfg-name').value || 'Unnamed',
                provider: providerSelect.value,
                model: modelSelect.value,
                apiKey: container.querySelector('#cfg-apikey').value,
                baseUrl: container.querySelector('#cfg-baseurl').value
            };

            LLM.saveConfig(config);

            // Set as active if first config
            if (LLM.getConfigs().length === 1) {
                LLM.setActiveConfig(config.id);
            }

            closeEditor();
            SettingsPanel.render(container, state);
        };

        // Test connection
        container.querySelector('#btn-test-config').onclick = async () => {
            const btn = container.querySelector('#btn-test-config');
            btn.disabled = true;
            btn.textContent = 'Testing...';
            testResult.innerHTML = '<span class="test-pending">Connecting...</span>';

            const config = {
                provider: providerSelect.value,
                model: modelSelect.value,
                apiKey: container.querySelector('#cfg-apikey').value,
                baseUrl: container.querySelector('#cfg-baseurl').value
            };

            try {
                await LLM.testConfig(config);
                testResult.innerHTML = '<span class="test-success">✓ Connection successful!</span>';
            } catch (e) {
                testResult.innerHTML = `<span class="test-error">✗ ${Utils.escapeHtml(e.message)}</span>`;
            }

            btn.disabled = false;
            btn.textContent = 'Test Connection';
        };

        // Config card actions
        configsList.querySelectorAll('.config-card').forEach(card => {
            const id = card.dataset.id;

            card.querySelector('.btn-activate').onclick = () => {
                LLM.setActiveConfig(id);
                SettingsPanel.render(container, state);
            };

            card.querySelector('.btn-edit').onclick = () => {
                const cfg = LLM.getConfigs().find(c => c.id === id);
                openEditor(cfg);
            };

            card.querySelector('.btn-delete').onclick = async () => {
                const confirmed = await Modal.confirm('Delete Config', 'Delete this configuration?');
                if (confirmed) {
                    LLM.deleteConfig(id);
                    SettingsPanel.render(container, state);
                    Toast.show('Configuration deleted', 'success');
                }
            };
        });
    }
};
