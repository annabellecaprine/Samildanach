/**
 * Core LLM Service
 * Multi-provider LLM client for AI generation.
 * Ported from Anansi with adaptations for Samildánach.
 * @module Core/LLM
 */

const STORAGE_KEY = 'samildanach_llm_configs';
const ACTIVE_CONFIG_KEY = 'samildanach_active_config_id';

export const LLM = {
    /**
     * Get all saved LLM configurations
     * @returns {Array}
     */
    getConfigs() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },

    /**
     * Save a configuration
     * @param {Object} config - { id, name, provider, model, apiKey, baseUrl }
     */
    saveConfig(config) {
        const configs = this.getConfigs();
        const idx = configs.findIndex(c => c.id === config.id);
        if (idx >= 0) {
            configs[idx] = config;
        } else {
            configs.push(config);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    },

    /**
     * Delete a configuration
     * @param {string} id
     */
    deleteConfig(id) {
        const configs = this.getConfigs().filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
        if (localStorage.getItem(ACTIVE_CONFIG_KEY) === id) {
            localStorage.removeItem(ACTIVE_CONFIG_KEY);
        }
    },

    /**
     * Get the active configuration
     * @returns {Object|null}
     */
    getActiveConfig() {
        const configs = this.getConfigs();
        const activeId = localStorage.getItem(ACTIVE_CONFIG_KEY);
        return configs.find(c => c.id === activeId) || configs[0] || null;
    },

    /**
     * Set the active configuration
     * @param {string} id
     */
    setActiveConfig(id) {
        localStorage.setItem(ACTIVE_CONFIG_KEY, id);
    },

    /**
     * Generate a response from the LLM
     * @param {string} system - System instruction
     * @param {Array} history - Array of {role, content} messages
     * @param {Object} overrideConfig - Optional config overrides
     * @returns {Promise<string>}
     */
    async generate(system, history, overrideConfig = {}) {
        const storedConfig = this.getActiveConfig() || {};
        const config = { ...storedConfig, ...overrideConfig };

        const provider = config.provider || 'gemini';
        const model = config.model || 'gemini-1.5-flash';
        const key = config.apiKey || '';
        const maxTokens = config.maxTokens || 4096;

        // Check for key (except local providers)
        if (!key && provider !== 'kobold') {
            throw new Error(`Missing API Key for ${provider}. Please configure in Settings.`);
        }

        // --- GEMINI ---
        if (provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

            const contents = history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const body = {
                contents,
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: maxTokens
                }
            };

            if (system) {
                body.systemInstruction = { parts: [{ text: system }] };
            }

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error?.message || resp.statusText);
            }

            const data = await resp.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "(No response)";
        }

        // --- OPENAI / OPENROUTER / CHUTES / CUSTOM ---
        if (['openai', 'openrouter', 'chutes', 'custom'].includes(provider)) {
            let url = 'https://api.openai.com/v1/chat/completions';
            if (provider === 'openrouter') url = 'https://openrouter.ai/api/v1/chat/completions';
            if (provider === 'chutes') url = 'https://llm.chutes.ai/v1/chat/completions';
            if (provider === 'custom') {
                const baseUrl = (config.baseUrl || 'https://api.example.com/v1').replace(/\/$/, '');
                url = `${baseUrl}/chat/completions`;
            }

            const messages = [
                { role: 'system', content: system },
                ...history.map(m => ({
                    role: m.role === 'model' ? 'assistant' : m.role,
                    content: m.content
                }))
            ];

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            };

            if (provider === 'openrouter') {
                headers['HTTP-Referer'] = 'https://samildanach.app';
                headers['X-Title'] = 'Samildánach';
            }

            // Retry loop for context limit handling
            let currentMaxTokens = maxTokens;
            let attempts = 0;
            const MAX_RETRIES = 1;

            while (attempts <= MAX_RETRIES) {
                const resp = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.9,
                        max_tokens: currentMaxTokens
                    })
                });

                if (!resp.ok) {
                    const err = await resp.json();
                    const errMsg = err.error?.message || resp.statusText;

                    // Check for context limit error
                    const contextMatch = errMsg.match(/maximum context length is (\d+) tokens.*requested about (\d+) tokens.*\((\d+) in the messages/);

                    if (contextMatch && attempts < MAX_RETRIES) {
                        const allowed = parseInt(contextMatch[1]);
                        const input = parseInt(contextMatch[3]);
                        const buffer = 200;
                        const newLimit = allowed - input - buffer;

                        if (newLimit > 0) {
                            console.warn(`[LLM] Context limit exceeded. Auto-scaling max_tokens from ${currentMaxTokens} to ${newLimit}.`);
                            currentMaxTokens = newLimit;
                            attempts++;
                            continue;
                        }
                    }

                    throw new Error(errMsg);
                }

                const data = await resp.json();
                let content = data.choices?.[0]?.message?.content || "";

                // DeepSeek reasoning extraction
                const reasoning = data.choices?.[0]?.message?.reasoning_content;
                if (reasoning) {
                    content = `<think>${reasoning}</think>\n${content}`;
                }

                return content || "(No response)";
            }
        }

        // --- ANTHROPIC ---
        if (provider === 'anthropic') {
            const url = 'https://api.anthropic.com/v1/messages';

            const messages = history.map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.content
            }));

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'x-api-key': key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model,
                    max_tokens: maxTokens,
                    system,
                    messages,
                    temperature: 0.9
                })
            });

            if (!resp.ok) {
                const err = await resp.json();
                throw new Error(err.error?.message || resp.statusText);
            }

            const data = await resp.json();
            return data.content?.[0]?.text || "(No response)";
        }

        // --- KOBOLD (Local) ---
        if (provider === 'kobold') {
            const baseUrl = (config.baseUrl || 'http://localhost:5001').replace(/\/$/, '');
            const url = `${baseUrl}/api/v1/generate`;

            const fullPrompt = `${system}\n\n${history.map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            ).join('\n')}`;

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    max_context_length: 4096,
                    max_length: maxTokens > 2048 ? 2048 : maxTokens,
                    temperature: 0.9
                })
            });

            if (!resp.ok) {
                const errText = await resp.text();
                throw new Error(`Kobold Error: ${errText || resp.statusText}`);
            }

            const data = await resp.json();
            return data.results?.[0]?.text || "(No response)";
        }

        throw new Error(`Unknown provider: ${provider}`);
    },

    /**
     * Test a configuration
     * @param {Object} config
     * @returns {Promise<boolean>}
     */
    async testConfig(config) {
        try {
            await this.generate(
                'You are a test assistant.',
                [{ role: 'user', content: 'Say "Hello" in one word.' }],
                config
            );
            return true;
        } catch (e) {
            throw e;
        }
    }
};

// Provider presets for UI
export const PROVIDER_PRESETS = [
    { id: 'gemini', label: 'Google Gemini', models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'] },
    { id: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'openrouter', label: 'OpenRouter', models: ['anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5', 'meta-llama/llama-3.1-405b-instruct'] },
    { id: 'anthropic', label: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
    { id: 'chutes', label: 'Chutes AI', models: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1'] },
    { id: 'kobold', label: 'Kobold AI (Local)', models: ['local'], baseUrl: 'http://localhost:5001' },
    { id: 'custom', label: 'Custom Endpoint', models: ['custom'] }
];
