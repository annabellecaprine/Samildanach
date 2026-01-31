/**
 * Panel: Laboratory
 * Sandbox for testing game mechanics, dice expressions, and simulations.
 */

import { Dice } from '../../core/dice.js';
import { Simulator } from '../../core/simulator.js';
import { Utils } from '../../core/utils.js';
import { Toast } from '../../components/toast/index.js';

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
                        Test dice expressions and run probability simulations.
                    </p>
                    
                    <!-- Quick Roll -->
                    <div class="dice-roller">
                        <label class="label">Quick Roll</label>
                        <div class="dice-expression-row">
                            <input id="lab-expr" type="text" placeholder="e.g. 2d6+3" class="input flex-1" value="2d6">
                            <button id="lab-roll" class="btn btn-primary">Roll</button>
                        </div>
                        <div id="lab-stats" class="text-muted text-sm" style="margin-top:8px;"></div>
                        <div id="lab-result" class="dice-result">
                            Enter an expression and click Roll.
                        </div>
                    </div>

                    <!-- Simulation -->
                    <div class="simulation-section">
                        <h2 class="section-title">Probability Simulation</h2>
                        <div class="simulation-controls">
                            <div class="flex gap-sm">
                                <input id="sim-expr" type="text" placeholder="e.g. 3d6" class="input flex-1" value="2d6">
                                <select id="sim-iterations" class="input">
                                    <option value="100">100 rolls</option>
                                    <option value="1000" selected>1,000 rolls</option>
                                    <option value="10000">10,000 rolls</option>
                                </select>
                                <button id="sim-run" class="btn btn-primary">Run</button>
                            </div>
                        </div>
                        
                        <div id="sim-results" class="simulation-results" style="display:none;">
                            <div class="stats-row">
                                <div class="stat-box"><span id="stat-min">-</span><small>Min</small></div>
                                <div class="stat-box"><span id="stat-max">-</span><small>Max</small></div>
                                <div class="stat-box"><span id="stat-mean">-</span><small>Mean</small></div>
                                <div class="stat-box"><span id="stat-median">-</span><small>Median</small></div>
                                <div class="stat-box"><span id="stat-mode">-</span><small>Mode</small></div>
                                <div class="stat-box"><span id="stat-stddev">-</span><small>Std Dev</small></div>
                            </div>
                            <div id="histogram" class="histogram"></div>
                        </div>
                    </div>

                    <!-- Compare -->
                    <div class="compare-section">
                        <h2 class="section-title">Compare Expressions</h2>
                        <div class="compare-inputs">
                            <input id="cmp-expr1" type="text" placeholder="Expression 1" class="input" value="1d20">
                            <span class="text-muted">vs</span>
                            <input id="cmp-expr2" type="text" placeholder="Expression 2" class="input" value="2d10">
                            <button id="cmp-run" class="btn btn-secondary">Compare</button>
                        </div>
                        <div id="cmp-results" class="compare-results" style="display:none;"></div>
                    </div>
                </div>
            </div>
        `;

        // Quick Roll
        const exprInput = container.querySelector('#lab-expr');
        const rollBtn = container.querySelector('#lab-roll');
        const resultEl = container.querySelector('#lab-result');
        const statsEl = container.querySelector('#lab-stats');

        exprInput.oninput = () => {
            const stats = Dice.stats(exprInput.value);
            if (stats) {
                statsEl.innerText = `Range: ${stats.min}–${stats.max} | Average: ${stats.average}`;
            } else {
                statsEl.innerText = '';
            }
        };
        exprInput.oninput(); // Initial

        rollBtn.onclick = () => {
            const expr = exprInput.value.trim();
            if (!expr) return;

            const result = Dice.roll(expr);
            if (result.error) {
                resultEl.innerHTML = `<span style="color:var(--status-error);">${Utils.escapeHtml(result.error)}</span>`;
            } else {
                resultEl.innerHTML = `
                    <div><strong>Rolls:</strong> [${result.rolls.join(', ')}]</div>
                    ${result.modifier !== 0 ? `<div><strong>Modifier:</strong> ${result.modifier > 0 ? '+' : ''}${result.modifier}</div>` : ''}
                    <div class="roll-total"><strong>Total:</strong> ${result.total}</div>
                `;
            }
        };

        exprInput.onkeydown = (e) => { if (e.key === 'Enter') rollBtn.onclick(); };

        // Simulation
        const simExpr = container.querySelector('#sim-expr');
        const simIterations = container.querySelector('#sim-iterations');
        const simRun = container.querySelector('#sim-run');
        const simResults = container.querySelector('#sim-results');
        const histogram = container.querySelector('#histogram');

        simRun.onclick = () => {
            const expr = simExpr.value.trim();
            const iterations = parseInt(simIterations.value);
            if (!expr) return;

            simRun.disabled = true;
            simRun.innerText = 'Running...';

            // Use setTimeout to allow UI update
            setTimeout(() => {
                const result = Simulator.runDiceSimulation(expr, iterations);

                simRun.disabled = false;
                simRun.innerText = 'Run';

                if (result.error) {
                    simResults.style.display = 'none';
                    Toast.show(result.error, 'error');
                    return;
                }

                simResults.style.display = 'block';

                // Stats
                container.querySelector('#stat-min').innerText = result.stats.min;
                container.querySelector('#stat-max').innerText = result.stats.max;
                container.querySelector('#stat-mean').innerText = result.stats.mean;
                container.querySelector('#stat-median').innerText = result.stats.median;
                container.querySelector('#stat-mode').innerText = result.stats.mode;
                container.querySelector('#stat-stddev').innerText = result.stats.stdDev;

                // Histogram
                const histData = Simulator.getHistogramData(result);
                const maxCount = Math.max(...histData.map(d => d.count));

                histogram.innerHTML = histData.map(d => `
                    <div class="hist-bar-container">
                        <div class="hist-bar" style="height: ${(d.count / maxCount) * 100}%;" title="${d.value}: ${d.count} (${d.percentage}%)"></div>
                        <span class="hist-label">${d.value}</span>
                    </div>
                `).join('');
            }, 10);
        };

        // Compare
        const cmpExpr1 = container.querySelector('#cmp-expr1');
        const cmpExpr2 = container.querySelector('#cmp-expr2');
        const cmpRun = container.querySelector('#cmp-run');
        const cmpResults = container.querySelector('#cmp-results');

        cmpRun.onclick = () => {
            const expr1 = cmpExpr1.value.trim();
            const expr2 = cmpExpr2.value.trim();
            if (!expr1 || !expr2) return;

            const result = Simulator.compare(expr1, expr2, 1000);

            if (result.error) {
                cmpResults.style.display = 'none';
                Toast.show(result.error, 'error');
                return;
            }

            cmpResults.style.display = 'block';
            cmpResults.innerHTML = `
                <div class="compare-stat">
                    <strong>${Utils.escapeHtml(expr1)}</strong> wins <span class="highlight">${result.comparison.win1Pct}%</span> of the time
                    <small>(avg: ${result.expr1.stats.mean})</small>
                </div>
                <div class="compare-stat">
                    <strong>${Utils.escapeHtml(expr2)}</strong> wins <span class="highlight">${result.comparison.win2Pct}%</span> of the time
                    <small>(avg: ${result.expr2.stats.mean})</small>
                </div>
                <div class="compare-stat tie">
                    Ties: ${result.comparison.tiePct}%
                </div>
            `;
        };
    }
};
