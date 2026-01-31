/**
 * Panel: Laboratory
 * Sandbox for testing game mechanics and dice expressions.
 * Uses core/dice.js for reusable dice logic.
 */

import { Dice } from '../../core/dice.js';

export const LaboratoryPanel = {
    id: 'laboratory',
    label: 'Laboratory',
    icon: '🧪',

    render: (container, state) => {
        container.innerHTML = `
            <div class="laboratory-layout">
                <div class="laboratory-content">
                    <h1 class="laboratory-title">Laboratory</h1>
                    <p class="laboratory-description">
                        Test dice expressions and game mechanics here.
                    </p>
                    
                    <div class="dice-roller">
                        <label class="label" style="display:block; margin-bottom:8px;">Dice Expression</label>
                        <div class="dice-expression-row">
                            <input id="lab-expr" type="text" placeholder="e.g. 2d6+3" class="input flex-1">
                            <button id="lab-roll" class="btn btn-primary">Roll</button>
                        </div>
                        <div id="lab-stats" class="text-muted text-sm" style="margin-top:8px;"></div>
                        <div id="lab-result" class="dice-result">
                            Enter an expression and click Roll.
                        </div>
                    </div>
                </div>
            </div>
        `;

        const exprInput = container.querySelector('#lab-expr');
        const rollBtn = container.querySelector('#lab-roll');
        const resultEl = container.querySelector('#lab-result');
        const statsEl = container.querySelector('#lab-stats');

        // Show stats on input
        exprInput.oninput = () => {
            const stats = Dice.stats(exprInput.value);
            if (stats) {
                statsEl.innerText = `Range: ${stats.min}–${stats.max} | Average: ${stats.average}`;
            } else {
                statsEl.innerText = '';
            }
        };

        rollBtn.onclick = () => {
            const expr = exprInput.value.trim();
            if (!expr) return;

            const result = Dice.roll(expr);
            if (result.error) {
                resultEl.innerHTML = `<span style="color:var(--status-error);">${result.error}</span>`;
            } else {
                resultEl.innerHTML = `
                    <div><strong>Rolls:</strong> [${result.rolls.join(', ')}]</div>
                    <div><strong>Subtotal:</strong> ${result.subtotal}</div>
                    ${result.modifier !== 0 ? `<div><strong>Modifier:</strong> ${result.modifier > 0 ? '+' : ''}${result.modifier}</div>` : ''}
                    <div style="font-size:20px; margin-top:8px;"><strong>Total:</strong> ${result.total}</div>
                `;
            }
        };

        exprInput.onkeydown = (e) => {
            if (e.key === 'Enter') rollBtn.onclick();
        };
    }
};
