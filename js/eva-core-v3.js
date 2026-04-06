/**
 * E.V.A. PRO — Execution & UI Interaction Engine
 * DGZ Engineering Lab © 2026
 * 
 * This file contains the logic for both IPC and Avalúo modes,
 * including data parsing, UI rendering, and interaction effects.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- DOM Elements ---
    const sysInputArea = document.getElementById('mainInput');
    const bIpc = document.getElementById('btnIpc');
    const bAva = document.getElementById('btnAvaluo');
    const bExec = document.getElementById('execBtn');
    const pTitle = document.getElementById('panelTitle');
    const pIcon = document.getElementById('panelIcon');
    const resultsUI = document.getElementById('resultsUI');
    const resultsAvaluo = document.getElementById('resultsAvaluo');
    const kpiCount = document.getElementById('kpiCount');
    const eliteChartEl = document.getElementById('eliteChart');

    // --- Shared Constants & State ---
    // Dynamic Factor: Can be overridden by enhancement module for year selection
    window.ZENITH_FACTOR = window.ZENITH_FACTOR || 1.5226;
    function getZenithFactor() { return window.ZENITH_FACTOR || 1.5226; }
    const fmtElite = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    });
    const CURRENT_VERSION = "3.1.0";
    let currentMode = 'ipc';
    let actParsedAvaluo = [];
    let compChart = null;
    let distChart = null;
    let catChart = null;
    let auditorActive = false;

    const combinedPanel = document.getElementById('combinedAnalyticsPanel');
    const compPanel = document.getElementById('comparisonPanel');
    const distPanel = combinedPanel; // Same element, aliased for clarity
    const metricsPanel = document.getElementById('metricsPanel');

    // --- Initialization: Persistence (Auto-Save) ---
    if (localStorage.getItem('evaInputData')) {
        sysInputArea.value = localStorage.getItem('evaInputData');
    }
    // --- Phase 3: Forensic Ledger & State ---
    let sessionLedger = JSON.parse(localStorage.getItem('evaLedger')) || [];
    const validationPanel = document.getElementById('validationStatus');
    const validationMessage = document.getElementById('vMessage');

    sysInputArea.addEventListener('input', (e) => {
        localStorage.setItem('evaInputData', e.target.value);
        validateInput(e.target.value);
    });

    function validateInput(val) {
        if (!val.trim()) {
            validationPanel.style.display = 'none';
            return;
        }
        validationPanel.style.display = 'block';
        const lines = val.split('\n').filter(l => l.trim());
        let errors = [];

        lines.forEach((line, i) => {
            if (currentMode === 'avaluo') {
                const p = line.split(/\t|\||;/).map(x => x.trim()).filter(x => x !== '');
                if (p.length === 0) return; // Ignorar líneas totalmente vacías
                if (p.length < 3) errors.push(`Línea ${i + 1}: Faltan datos (necesita: Especie, Diámetro, Altura)`);
                else if (isNaN(parseFloat(p[1].replace(',', '.')))) errors.push(`Línea ${i + 1}: El diámetro no parece ser un número válido`);
            }
        });

        if (errors.length > 0) {
            validationMessage.innerHTML = `<i data-lucide="alert-circle" style="width:14px;"></i> ⚠ ${errors[0]}`;
            validationMessage.className = 'v-body error';
        } else {
            validationMessage.innerHTML = `<i data-lucide="shield-check" style="width:14px;"></i> ✓ Datos correctos (${lines.length} registros encontrados)`;
            validationMessage.className = 'v-body';
        }
        lucide.createIcons();
    }

    window.saveToLedger = function (summary) {
        const entry = {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            mode: currentMode,
            data: sysInputArea.value,
            summary: summary
        };
        sessionLedger.unshift(entry);
        if (sessionLedger.length > 10) sessionLedger.pop();
        localStorage.setItem('evaLedger', JSON.stringify(sessionLedger));
        renderLedger();
    };

    function renderLedger() {
        const container = document.getElementById('sessionHistory');
        if (sessionLedger.length === 0) {
            container.innerHTML = '<div class="empty-history">Aún no hay cálculos guardados</div>';
            return;
        }
        container.innerHTML = sessionLedger.map(item => `
            <div class="history-item" onclick="loadFromLedger(${item.id})">
                <div class="h-main">
                    <div class="h-time">${item.date} ${item.time}</div>
                    <div class="h-desc">${item.mode.toUpperCase()}: ${item.summary}</div>
                </div>
                <button class="h-del" onclick="event.stopPropagation(); deleteFromLedger(${item.id})" title="ELIMINAR REGISTRO">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');
        if (window.lucide) lucide.createIcons();
    }

    window.deleteFromLedger = function (id) {
        sessionLedger = sessionLedger.filter(i => i.id !== id);
        localStorage.setItem('evaLedger', JSON.stringify(sessionLedger));
        renderLedger();
        EVA.toast('Registro eliminado del historial', 'warning');
    };

    window.loadFromLedger = function (id) {
        const item = sessionLedger.find(i => i.id === id);
        if (item) {
            sysInputArea.value = item.data;
            switchMode(item.mode);
            executeAction();
            EVA.toast('Datos restaurados correctamente', 'info');
        }
    };
    renderLedger(); // Initial load

    // --- Core Logic functions (Exported to window for legacy support if needed, 
    // but preferred via listeners) ---

    window.sanitizeText = function (str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    };

    window.cleanVal = function (str) {
        const cleaned = str.replace(/[^\d,.-]/g, '');
        if (!cleaned) return 0;
        if (cleaned.includes(',') && cleaned.includes('.')) {
            const lastComma = cleaned.lastIndexOf(',');
            const lastDot = cleaned.lastIndexOf('.');
            if (lastComma > lastDot) {
                // Colombian: dots=thousands, comma=decimal
                return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
            } else {
                // US: commas=thousands, dot=decimal
                return parseFloat(cleaned.replace(/,/g, '')) || 0;
            }
        }
        if (cleaned.includes(',') && !cleaned.includes('.')) {
            const parts = cleaned.split(',');
            if (parts.length === 2 && parts[1].length <= 2) {
                return parseFloat(cleaned.replace(',', '.')) || 0;
            }
            return parseFloat(cleaned.replace(/,/g, '')) || 0;
        }
        return parseFloat(cleaned) || 0;
    };

    window.switchTab = function (tabId) {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        // Sync Forensic Stepper
        document.querySelectorAll('.step-btn').forEach(s => s.classList.remove('active'));
        const stepMap = { 'tab-input': 's1', 'tab-analytics': 's2', 'tab-results': 's3' };
        const step = document.getElementById(stepMap[tabId]);
        if (step) step.classList.add('active');

        const activeTab = document.getElementById(tabId);
        if (activeTab) activeTab.classList.add('active');

        // Expert Detail Expansion
        if (tabId === 'tab-results' || tabId === 'tab-analytics') {
            document.querySelector('.main-stage').classList.add('expanded');
        } else {
            document.querySelector('.main-stage').classList.remove('expanded');
        }

        // --- FIXED: Switch correct results block within tab-results ---
        if (tabId === 'tab-results') {
            if (currentMode === 'ipc') {
                resultsUI.style.display = 'flex'; // FIXED FROM BLOCK
                resultsAvaluo.style.display = 'none';
            } else {
                resultsUI.style.display = 'none';
                resultsAvaluo.style.display = 'flex'; // FIXED FROM BLOCK
            }
        }

        if (window.lucide) lucide.createIcons();
    };

    window.scanData = function (val) {
        const registry = document.getElementById('visualRegistry');
        if (!val.trim()) { registry.innerHTML = ''; return; }

        const lines = val.trim().split('\n').filter(l => l.length > 5);
        registry.innerHTML = '';

        // Render up to 5 visual cards for preview
        lines.slice(0, 5).forEach((line, i) => {
            const card = document.createElement('div');
            card.className = 'f-card';
            const parts = line.split(/[|\t\s]{2,}/);
            const name = parts[0]?.substring(0, 15) || 'Sin nombre';
            const val = parts[1] || '---';

            card.innerHTML = `
                <div class="f-card-icon"><i data-lucide="${line.includes('|') ? 'tree-pine' : 'hash'}"></i></div>
                <div class="f-card-label">${line.includes('|') ? 'Especie' : 'Valor'}</div>
                <div class="f-card-val">${name.toUpperCase()}</div>
                <div style="font-size:0.5rem; opacity:0.5;">Registro ${i + 1}</div>
            `;
            registry.appendChild(card);
        });

        if (lines.length > 5) {
            const more = document.createElement('div');
            more.style = "display:flex; align-items:center; padding:1rem; color:var(--primary); font-size:0.6rem; font-weight:800;";
            more.innerText = `+ ${lines.length - 5} registros más...`;
            registry.appendChild(more);
        }

        if (window.lucide) lucide.createIcons();
    };

    window.animateValue = function (id, end) {
        const obj = document.getElementById(id);
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            obj.innerText = `$ ${current.toLocaleString()}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerText = `$ ${end.toLocaleString()}`;
            }
        }
        window.requestAnimationFrame(step);
    };

    window.showHelp = function () {
        EVA.toast('1. Pegue sus datos en el área de texto', 'info', 4000);
        setTimeout(() => EVA.toast('2. El sistema detectará los datos automáticamente', 'info', 4000), 1000);
        setTimeout(() => EVA.toast('3. Presione "Calcular Valores" para ver los resultados', 'info', 4000), 2000);
    };

    window.switchMode = function (mode) {
        currentMode = mode;
        if (mode === 'ipc') {
            bIpc.classList.add('active'); bAva.classList.remove('active');
            bExec.innerHTML = '<i data-lucide="play"></i> Calcular Valores';
            bExec.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            if (pTitle) pTitle.innerText = 'Ingrese sus datos aquí';
            if (pIcon) pIcon.innerText = 'Listo para calcular';
            sysInputArea.placeholder = "📋  Pegue aquí los valores que desea actualizar...\n\nEjemplo: Copie y pegue una columna de Excel con valores como:\n1.500.000\n2.300.000\n850.000";
        } else {
            bAva.classList.add('active'); bIpc.classList.remove('active');
            bExec.innerHTML = '<i data-lucide="zap"></i> Calcular Valoración';
            bExec.style.background = 'linear-gradient(135deg, var(--warning), #D97706)';
            if (pTitle) pTitle.innerText = 'Calculadora de Valoración de Árboles y Especies';
            if (pIcon) { pIcon.innerText = 'Listo para calcular'; pIcon.style.color = 'var(--warning)'; }
            sysInputArea.placeholder = "🌳  Pegue aquí los datos de los árboles...\n# Recuerde que puede escribir los valores manualmente teniendo encuenta que desdes de cada espacio debe ir el simbolo | \n\nFormato: Especie | Diámetro(cm) | Altura(m)\nEjemplo:\nCedro | 35 | 12\nRoble | 40 | 15";
        }
        if (window.lucide) lucide.createIcons();
    };

    window.executeAction = function () {
        // Visual feedback on execution
        document.body.style.filter = 'brightness(1.1) contrast(1.1)';
        setTimeout(() => document.body.style.filter = 'none', 150);

        if (currentMode === 'ipc') executeZenith();
        else executeAvaluo();

        // Auto-switch to Results tab
        setTimeout(() => switchTab('tab-results'), 300);
    };

    window.clearInput = function () {
        sysInputArea.value = '';
        resultsUI.style.display = 'none';
        resultsAvaluo.style.display = 'none';
        validationPanel.style.display = 'none';
        const pdfBtn = document.getElementById('pdfBtn');
        if (pdfBtn) pdfBtn.style.display = 'none';
        if (distPanel) distPanel.style.display = 'none';
        if (combinedPanel) combinedPanel.style.display = 'none';
        if (metricsPanel) metricsPanel.style.display = 'none';

        // Reset HUD
        document.getElementById('sumFinal').innerText = '$ 0';
        document.getElementById('sumOrig').innerText = '$ 0';
        kpiCount.textContent = '0';

        // Clear Table Bodies
        document.getElementById('eliteBody').innerHTML = '';
        document.getElementById('avaluoBody').innerHTML = '';
        document.getElementById('avaluoSummaryBody').innerHTML = '';

        localStorage.removeItem('evaInputData');
        EVA.toast('✓ Sistema reiniciado — Listo para nueva valoración', 'info');
    };

    // --- Advanced Forensic Notification Protocol ---
    const hudPool = document.createElement('div');
    hudPool.id = 'eva-monolith-pool';
    document.body.appendChild(hudPool);

    window.EVA = {
        toast: function (msg, type = 'success', duration = 4000) {
            const entry = document.createElement('div');
            entry.className = `eva-mono-entry ${type}`;

            const icon = type === 'success' ? 'check-circle' : type === 'warning' ? 'alert-circle' : 'info';

            entry.innerHTML = `
                <div class="mono-bar"></div>
                <div class="mono-content">
                    <span class="mono-tag"><i data-lucide="${icon}" style="width:12px;height:12px;"></i> ${type.toUpperCase()}</span>
                    <span class="mono-msg">${msg}</span>
                </div>
            `;

            hudPool.appendChild(entry);
            if (window.lucide) lucide.createIcons();

            setTimeout(() => entry.classList.add('phase-in'), 10);

            if (duration > 0) {
                setTimeout(() => {
                    entry.classList.remove('phase-in');
                    setTimeout(() => entry.remove(), 800);
                }, duration);
            }
            return entry; // Return for manual persistence
        }
    };

    // --- Dynamic Evolution: Version Polling ---
    async function checkSystemUpdates() {
        try {
            const response = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
            const serverData = await response.json();

            if (serverData.version !== CURRENT_VERSION) {
                console.log(`[E.V.A.] Update detected: ${CURRENT_VERSION} -> ${serverData.version}`);

                const updateMsg = `Sincronizando nueva versión (${serverData.version}). El sistema se reiniciará en 5 segundos...`;
                const toast = EVA.toast(updateMsg, 'warning', 0); // Persistent toast

                // Force SW update
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration().then(reg => {
                        if (reg) reg.update();
                    });
                }

                setTimeout(() => {
                    localStorage.setItem('evaInputData', sysInputArea.value); // Backup current input
                    location.reload(true);
                }, 5000);
            }
        } catch (err) {
            console.warn('[E.V.A.] Update check failed:', err);
        }
    }

    // Check on startup and every 10 minutes
    checkSystemUpdates();
    setInterval(checkSystemUpdates, 10 * 60 * 1000);

    // Check when user returns to the tab
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkSystemUpdates();
    });


    // --- [E.V.A. V5] FORENSIC TOOLS (PERSISTENCE, SEARCH, AUDITOR) ---

    window.saveSessionFile = function () {
        const data = {
            version: CURRENT_VERSION,
            timestamp: new Date().toISOString(),
            input: sysInputArea.value,
            ledger: sessionLedger,
            mode: currentMode,
            theme: localStorage.getItem('evaTheme') || 'dark'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `Proyecto_EVA_${date}.eva`;
        a.click();
        EVA.toast('✓ Proyecto exportado (.eva) correctamente');
    };

    window.loadSessionFile = function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                sysInputArea.value = data.input || '';
                sessionLedger = (data.ledger && Array.isArray(data.ledger)) ? data.ledger : [];
                localStorage.setItem('evaLedger', JSON.stringify(sessionLedger));
                if (data.mode) switchMode(data.mode);
                renderLedger();
                EVA.toast('✓ Proyecto cargado con éxito', 'success');
                executeAction(); // Auto-calculate on load
            } catch (err) {
                console.error(err);
                EVA.toast('Error: El archivo .eva no es válido', 'error');
            }
        };
        reader.readAsText(file);
    };

    window.filterTable = function (bodyId, query) {
        const q = query.toLowerCase();
        const rows = document.getElementById(bodyId).querySelectorAll('tr');
        rows.forEach(row => {
            const txt = row.innerText.toLowerCase();
            row.style.display = txt.includes(q) ? '' : 'none';
        });
    };

    window.toggleAuditorMode = function () {
        auditorActive = document.getElementById('auditorMode').checked;
        if (currentMode === 'ipc') executeZenith();
        else renderAvaluoBoard();

        if (auditorActive) {
            EVA.toast('🛡️ Modo Auditor: Analizando integridad de datos...', 'warning');
        }
    };

    function auditRow(data, type) {
        if (!auditorActive) return '';
        if (type === 'ipc') {
            const val = cleanVal(data.toString());
            return (val > 500000000) ? 'auditor-flag' : ''; // Alerta > 500M COP
        } else {
            const d = parseFloat(data.ab);
            const alt = parseFloat(data.h);
            // Alertas Biológicas: Alturas > 45m o Diámetros < 10cm o > 200cm
            if (alt > 45 || d > 200 || d < 10) return 'auditor-flag';
            return '';
        }
    }

    window.copyText = async function (text) {
        try {
            await navigator.clipboard.writeText(text);
            EVA.toast('✓ Copiado al portapapeles');
        } catch (e) {
            EVA.toast('Error al copiar', 'warning');
        }
    };

    window.copyTable = async function (ids) {
        const idArray = typeof ids === 'string' ? ids.split(',').map(s => s.trim()) : ids;
        let combinedHTML = '';
        let combinedText = '';

        idArray.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                combinedHTML += el.outerHTML + '<br><br>';
                combinedText += el.innerText + '\n\n';
            }
        });

        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const blob = new Blob([combinedHTML], { type: 'text/html' });
                const plainText = new Blob([combinedText], { type: 'text/plain' });
                const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': plainText })];
                await navigator.clipboard.write(data);
                EVA.toast('✓ Tablas copiadas — listas para pegar en Excel');
            } catch (err) {
                copyLegacyText(combinedText);
            }
        } else {
            copyLegacyText(combinedText);
        }
    };

    function copyLegacyText(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            EVA.toast('✓ Datos copiados (Texto plano)');
        } catch (err) {
            EVA.toast('Error al copiar', 'warning');
        }
        document.body.removeChild(textArea);
    }

    window.exportTableToCSV = function (ids, defaultFilename) {
        let filename = prompt("Ingrese el nombre del archivo para exportar (CSV):", defaultFilename || "Reporte_EVA");
        if (!filename) return; // User cancelled
        if (!filename.endsWith('.csv')) filename += '.csv';

        let idArray = typeof ids === 'string' ? ids.split(',').map(s => s.trim()) : ids;
        let fullCsv = [];

        idArray.forEach(id => {
            const table = document.getElementById(id);
            if (!table) return;

            const rows = table.querySelectorAll('tr');
            for (let i = 0; i < rows.length; i++) {
                const row = [], cols = rows[i].querySelectorAll('td, th');
                for (let j = 0; j < cols.length; j++) {
                    if (window.getComputedStyle(cols[j]).display === 'none') continue;
                    let text = cols[j].innerText;
                    if (cols[j].classList.contains('num')) {
                        text = text.replace(/[$. ]/g, '').replace(',', '.');
                    }
                    row.push('"' + text.replace(/"/g, '""') + '"');
                }
                fullCsv.push(row.join(';'));
            }
            fullCsv.push(""); // Spacing between tables
        });

        const csvContent = "\uFEFF" + fullCsv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.click();
        EVA.toast('✓ CSV generado con todas las tablas');
    };

    window.exportTableToExcel = function (ids, defaultFilename) {
        let filename = prompt("Ingrese el nombre del archivo para exportar (EXCEL):", defaultFilename || "Reporte_EVA");
        if (!filename) return; // User cancelled
        if (!filename.endsWith('.xls')) filename += '.xls';

        let idArray = typeof ids === 'string' ? ids.split(',').map(s => s.trim()) : ids;
        let combinedHTML = '';

        idArray.forEach(id => {
            const table = document.getElementById(id);
            if (table) {
                const cloneTable = table.cloneNode(true);
                const originalSelects = table.querySelectorAll('select');
                const clonedSelects = cloneTable.querySelectorAll('select');
                for (let i = 0; i < originalSelects.length; i++) {
                    clonedSelects[i].parentNode.innerText = originalSelects[i].value;
                }

                // Remove hidden columns from clone
                cloneTable.querySelectorAll('th, td').forEach(cell => {
                    if (window.getComputedStyle(cell).display === 'none') {
                        cell.remove();
                    }
                });

                combinedHTML += `<table border="1">${cloneTable.innerHTML}</table><br>`;
            }
        });

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8">
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${filename}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
            <style>td { mso-number-format:"\\@"; } .col-hidden { display: none; } </style>
            </head>
            <body>${combinedHTML}</body>
            </html>
        `;

        const blob = new Blob([html], { type: "application/vnd.ms-excel" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename);
        link.click();
        EVA.toast('✓ Excel generado (incluye todas las tablas)', 'warning');
    };

    function executeZenith() {
        const txt = sysInputArea.value;
        if (!txt.trim()) return;
        const lines = txt.split('\n');
        const tbody = document.getElementById('eliteBody');
        tbody.innerHTML = ''; let count = 0;
        let totalOrig = 0;
        let totalNew = 0;

        lines.forEach((line) => {
            const parts = line.split(/\t|\s{2,}/).filter(p => p.trim().length > 0);
            const tags = (parts.length === 4) ? [' (40%)', ' (60%)', ' (70%)', ' (100%)'] : ['', '', '', ''];

            parts.forEach((part, idx) => {
                const val = cleanVal(part);
                if (val > 0) {
                    count++;
                    const updated = Math.round(val * getZenithFactor());
                    const delta = updated - val;
                    const tag = tags[idx] || '';
                    totalOrig += val;
                    totalNew += updated;

                    // Traceability Data
                    const zf = getZenithFactor();
                    const traceMsg = `SISTEMA E.V.A. - EVIDENCIA PERICIAL:\\n\\n` +
                        `Registro: #ZEN_${count.toString().padStart(3, '0')}\\n` +
                        `Valor Base: ${fmtElite.format(val)}\\n` +
                        `Algoritmo: Indexación IPC\\n` +
                        `Factor Aplicado: ${zf.toFixed(4)}\\n` +
                        `Operación Matricial: ${val.toLocaleString()} × ${zf.toFixed(4)}\\n` +
                        `Resultado Final: ${fmtElite.format(updated)}`;

                    const auditClass = auditRow(val, 'ipc');
                    const row = document.createElement('tr');
                    if (auditClass) row.className = auditClass;
                    row.innerHTML = `
                        <td class="num">
                            <span class="trace-icon" onclick="showTrace('${traceMsg}')" title="Ver Detalle Especie">
                                <i data-lucide="info" style="width:12px;height:12px;"></i>
                            </span>
                            #ZEN_${count.toString().padStart(3, '0')}${tag}
                        </td>
                        <td class="num">${fmtElite.format(val)}</td>
                        <td class="num upd">${fmtElite.format(updated)}</td>
                        <td class="num"><span class="delta">+ ${fmtElite.format(delta)}</span></td>
                    `;
                    tbody.appendChild(row);
                }
            });
        });

        // Populate IPC Summary
        const tbodySum = document.getElementById('eliteSummaryBody');
        if (tbodySum) {
            tbodySum.innerHTML = '';
            const summaryRow = document.createElement('tr');
            summaryRow.innerHTML = `
                <td style="font-weight:700;">VALOR TOTAL CONSOLIDADO IPC</td>
                <td class="num">${fmtElite.format(totalOrig)}</td>
                <td class="num upd">${fmtElite.format(totalNew)}</td>
                <td class="num"><span class="delta">+ ${fmtElite.format(totalNew - totalOrig)}</span></td>
            `;
            tbodySum.appendChild(summaryRow);
        }

        if (count > 0) {
            resultsUI.style.display = 'flex';
            resultsAvaluo.style.display = 'none';
            const pdfBtn = document.getElementById('pdfBtn');
            if (pdfBtn) pdfBtn.style.display = 'block';
            kpiCount.textContent = count;

            // Expert HUD Update with animation
            animateValue('sumFinal', totalNew);
            document.getElementById('sumOrig').innerText = `$ ${totalOrig.toLocaleString()}`;

            if (window.lucide) lucide.createIcons();
            EVA.toast(`✓ ${count} valores actualizados correctamente`);
            saveToLedger(`${count} valores actualizados con IPC`);

            // Trigger Unified Analytics for IPC (single consolidated call)
            const maxVal = Math.max(...lines.map(l => cleanVal(l))) || 0;
            updateLiveAnalytics({
                original: totalOrig,
                updated: totalNew,
                max: maxVal,
                items: count,
                species: { 'Proyección IPC': count }
            });
        }
    }

    window.showCustomAlert = function (speciesArray) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        const html = `
            <div class="modal-box">
                <div class="modal-title">
                    <i data-lucide="alert-circle"></i> ⚠ Especies no encontradas
                </div>
                <div class="modal-body">
                    Se encontraron <strong>${speciesArray.length}</strong> especie(s) que no están en nuestra base de datos. Se les asignó la categoría "Tercera" automáticamente para poder continuar con el cálculo.
                    <ul class="modal-list">
                        ${speciesArray.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                    💡 <strong>Consejo:</strong> Puede cambiar la categoría correcta de cada especie usando el menú desplegable <span style="color:var(--warning);">amarillo</span> que aparece en la tabla de resultados. Los valores se recalcularán automáticamente.
                </div>
                <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">Entendido, continuar</button>
            </div>
        `;

        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons();

        setTimeout(() => overlay.classList.add('active'), 10);
    };

    window.updateRowCat = function (id, newCat) {
        const rowIdx = actParsedAvaluo.findIndex(r => r.id === id);
        if (rowIdx > -1) {
            actParsedAvaluo[rowIdx].typeNorm = newCat;
            renderAvaluoBoard(false);
            EVA.toast(`✓ Categoría cambiada a "${newCat}" — valores recalculados`);
        }
    };

    window.showTrace = function (msg) {
        const lines = msg.split('\\n');
        const formatted = lines.map(line => `<div>${line}</div>`).join('');

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-box" style="border-color: var(--primary); max-width: 400px;">
                <div class="modal-title" style="color: var(--primary);">
                    <i data-lucide="shield-check"></i> Evidencia Pericial Matemática
                </div>
                <div class="modal-body" style="font-family: 'Space Mono', monospace; font-size: 0.75rem; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 8px; line-height: 1.5;">
                    ${formatted}
                </div>
                <button class="modal-btn" style="background: var(--primary); margin-top: 1rem;" onclick="this.closest('.modal-overlay').remove()">Cerrar Auditoría</button>
            </div>
        `;
        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons();
        setTimeout(() => overlay.classList.add('active'), 10);
    };

    function renderAvaluoBoard(showAlerts = false) {
        const tbody = document.getElementById('avaluoBody');
        const tbodySum = document.getElementById('avaluoSummaryBody');
        tbody.innerHTML = ''; tbodySum.innerHTML = '';

        let count = 0, s40 = 0, s60 = 0, s70 = 0, s100 = 0;
        const unknownSpecies = [];

        actParsedAvaluo.forEach(item => {
            try {
                const { id, esp, scientific, ab, alt, isUnknown, typeNorm } = item;
                const validType = typeNorm === 'Selección' ? 'Primera' : typeNorm;

                const t = AVALUO_DB[validType] || AVALUO_DB.Tercera;
                const abM = ab / 100;
                let cI = t.Cols.findIndex(c => c >= abM); if (cI === -1) cI = t.Cols.length - 2;
                let rI = t.Rows.findIndex(r => r >= alt); if (rI === -1) rI = t.Rows.length - 1;
                let base = t.Data[rI][cI] || 0;

                if (typeNorm === 'Selección') base = Math.round(base * 1.2);

                const v40 = base, v60 = (base * 60) / 40, v70 = (base * 70) / 40, v100 = (base * 100) / 40;
                s40 += v40; s60 += v60; s70 += v70; s100 += v100;

                const zf = getZenithFactor();
                const u40 = Math.round(v40 * zf);
                const u60 = Math.round(v60 * zf);
                const u70 = Math.round(v70 * zf);
                const u100 = Math.round(v100 * zf);

                if (isUnknown && showAlerts) unknownSpecies.push(esp);

                const sel1 = typeNorm === 'Primera' ? 'selected' : '';
                const sel2 = typeNorm === 'Segunda' ? 'selected' : '';
                const sel3 = typeNorm === 'Tercera' ? 'selected' : '';
                const selS = typeNorm === 'Selección' ? 'selected' : '';

                let catHTML = `<td class="col-cat">
                    <select class="cat-select" onchange="updateRowCat(${id}, this.value)" title="Modificar Categoría" ${!isUnknown ? 'style="border-color:rgba(255,255,255,0.1); color:var(--text-dim); background:transparent;"' : ''}>
                        <option value="Primera" ${sel1}>Primera</option>
                        <option value="Segunda" ${sel2}>Segunda</option>
                        <option value="Tercera" ${sel3}>Tercera</option>
                        <option value="Selección" ${selS}>Selección</option>
                    </select>
                </td>`;

                const traceMsg = `SISTEMA E.V.A. - EVIDENCIA PERICIAL:\\n\\n` +
                    `Especie: ${esp}\\n` +
                    `Nombre Científico: ${scientific || 'N/A'}\\n` +
                    `Categoría: ${typeNorm}\\n` +
                    `Diámetro (DAP): ${ab} cm\\n` +
                    `Altura: ${alt} m\\n` +
                    `Valor Base (40%): ${fmtElite.format(v40)}\\n` +
                    `Valor Proyectado (40%): ${fmtElite.format(u40)}\\n` +
                    `Valor Final (100%): ${fmtElite.format(u100)}`;

                const auditClass = auditRow({ ab: ab, h: alt }, 'avaluo');
                const row = document.createElement('tr');
                if (auditClass) row.className = auditClass;
                row.innerHTML = `
                    <td class="col-esp" style="font-weight:900; color:${isUnknown ? 'var(--warning)' : 'var(--text-main)'};">
                        <span class="trace-icon" onclick="showTrace('${traceMsg}')" title="Ver evidencia matemática" style="cursor:pointer; color:var(--primary); margin-right:5px;">
                            <i data-lucide="info" style="width:12px;height:12px;"></i>
                        </span>
                        ${esp} ${isUnknown && showAlerts ? '<span style="font-size:0.65rem; opacity:0.7; display:block;">⚠ No encontrada</span>' : ''}
                    </td>
                    <td class="col-sci" style="font-style:italic; font-size:0.75rem; color:var(--text-dim);">${scientific || '—'}</td>
                    ${catHTML}
                    <td class="num col-ab">${ab}</td>
                    <td class="num col-alt">${alt}</td>
                    <td class="num col-v40">${fmtElite.format(u40)}</td>
                    <td class="num col-v60">${fmtElite.format(u60)}</td>
                    <td class="num col-v70">${fmtElite.format(u70)}</td>
                    <td class="num upd col-v100">${fmtElite.format(u100)}</td>
                `;
                tbody.appendChild(row);
                count++;
            } catch (e) {
                console.error("Error en fila de avalúo:", e);
            }
        });

        if (window.lucide) lucide.createIcons();

        if (unknownSpecies.length > 0 && showAlerts) {
            showCustomAlert([...new Set(unknownSpecies)]);
        }

        if (count > 0) {
            const speciesData = {};
            const categoryData = { "Selección": 0, "Primera": 0, "Segunda": 0, "Tercera": 0 };
            let localMaxBase = 0;
            const sums = [{ l: "Valor Base (40%)", b: s40 }, { l: "Valor al 60%", b: s60 }, { l: "Valor al 70%", b: s70 }, { l: "Valor al 100%", b: s100 }];

            // Collect analytics
            actParsedAvaluo.forEach(item => {
                speciesData[item.esp] = (speciesData[item.esp] || 0) + 1;
                categoryData[item.typeNorm] = (categoryData[item.typeNorm] || 0) + 1;

                const t = AVALUO_DB[item.typeNorm === 'Selección' ? 'Primera' : item.typeNorm] || AVALUO_DB.Tercera;
                const abM = item.ab / 100;
                let cI = t.Cols.findIndex(c => c >= abM); if (cI === -1) cI = t.Cols.length - 2;
                let rI = t.Rows.findIndex(r => r >= item.alt); if (rI === -1) rI = t.Rows.length - 1;
                let base = t.Data[rI][cI] || 0;
                if (item.typeNorm === 'Selección') base = Math.round(base * 1.2);
                const v100 = (base * 100) / 40;
                if (v100 > localMaxBase) localMaxBase = v100;
            });

            sums.forEach(s => {
                const proyectado = Math.round(s.b * getZenithFactor());
                const row = document.createElement('tr');
                const catClass = s.l.includes('40%') ? 'col-v40' : s.l.includes('60%') ? 'col-v60' : s.l.includes('70%') ? 'col-v70' : 'col-v100';
                row.className = catClass;
                row.innerHTML = `
                    <td style="font-weight:700;">${s.l}</td>
                    <td class="num">${fmtElite.format(Math.round(s.b))}</td>
                    <td class="num upd">${fmtElite.format(proyectado)}</td>
                    <td class="num"><span class="delta">+ ${Math.round(((proyectado / s.b) - 1) * 100)}%</span></td>
                `;
                tbodySum.appendChild(row);
            });

            // Expert HUD Update (Forest)
            const overallFinal = Math.round(s100 * getZenithFactor());
            animateValue('sumFinal', overallFinal);
            document.getElementById('sumOrig').innerText = `$ ${Math.round(s100).toLocaleString()}`;
            kpiCount.textContent = count;

            updateLiveAnalytics({
                original: Math.round(s100),
                updated: overallFinal,
                species: speciesData,
                categories: categoryData,
                max: localMaxBase,
                items: count
            });

            if (showAlerts) {
                kpiCount.textContent = count;
                resultsAvaluo.style.display = 'flex';
                resultsUI.style.display = 'none';
                EVA.toast(`✓ Valoración completada: ${count} árboles calculados`);
                saveToLedger(`Valoración: ${count} árboles`);
            }
        }
    }

    function executeAvaluo() {
        const txt = sysInputArea.value;
        if (!txt.trim()) return;
        const lines = txt.split('\n');

        if (typeof AVALUO_DB === 'undefined') { EVA.toast('Error: La base de datos de especies no se cargó correctamente', 'warning'); return; }

        actParsedAvaluo = []; // reset state
        let rowIdCounter = 0;

        lines.forEach((line) => {
            if (!line.trim()) return;
            const p = line.split(/\t|\||;/).map(x => x.trim()).filter(x => x !== '');
            if (p.length >= 3) {
                const espRaw = p[0], ab = parseFloat(p[1].replace(',', '.')), alt = parseFloat(p[2].replace(',', '.'));
                if (isNaN(ab) || isNaN(alt)) return;

                const esp = sanitizeText(espRaw);
                let type = null;
                let isUnknown = false;
                let scientific = "";

                // Use enhanced fuzzy matching if available, fallback to exact
                if (typeof findSpeciesFuzzy === 'function') {
                    const match = findSpeciesFuzzy(espRaw);
                    type = match.type;
                    isUnknown = match.isUnknown;
                    scientific = match.scientific || "";
                } else {
                    let spL = esp.toLowerCase().trim();
                    const directCategories = ['selección', 'seleccion', 'primera', 'segunda', 'tercera'];
                    if (directCategories.includes(spL)) {
                        type = spL === 'seleccion' ? 'Selección' : esp.charAt(0).toUpperCase() + esp.slice(1).toLowerCase();
                    } else {
                        for (let s of AVALUO_DB.Species) {
                            if (s.Name.toLowerCase().trim() === spL) {
                                type = s.Type;
                                // In the fallback, if we have it
                                scientific = s.Scientific || "";
                                break;
                            }
                        }
                    }
                }

                if (!type) {
                    isUnknown = true;
                    type = "Tercera";
                }

                const typeNorm = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

                actParsedAvaluo.push({
                    id: rowIdCounter++, esp, scientific, ab, alt, isUnknown, typeNorm
                });
            }
        });

        renderAvaluoBoard(true);
    }

    // --- Interaction Engine Disabled (Static Protocol) ---


    // --- Phase 3: Live Analytics Dashboard ---
    window.updateLiveAnalytics = function (payload) {
        if (combinedPanel) combinedPanel.style.display = 'block';

        // 1. COMPARISON BAR CHART
        const ctxComp = document.getElementById('compChart').getContext('2d');
        if (compChart) compChart.destroy();
        
        const years = typeof getSelectedYears === 'function' ? getSelectedYears() : { from: 2018, to: 2025 };
        
        compChart = new Chart(ctxComp, {
            type: 'bar',
            plugins: [ChartDataLabels],
            data: {
                labels: [`Valor ${years.from}`, `Valor ${years.to}`],
                datasets: [{
                    label: 'Masa Monetaria',
                    data: [payload.original, payload.updated],
                    backgroundColor: ['rgba(100, 116, 139, 0.5)', 'rgba(0, 242, 254, 0.5)'],
                    borderColor: ['#64748B', '#00F2FE'],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: '#fff', anchor: 'end', align: 'top',
                        formatter: (val) => fmtElite.format(val),
                        font: { family: 'Space Mono', size: 10, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#64748B', font: { family: 'Space Mono', size: 9 }, callback: v => '$' + v.toLocaleString() }
                    },
                    x: { ticks: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } }
                }
            }
        });

        // 2. DISTRIBUTION PIE CHART
        if (payload.species) {
            if (distPanel) distPanel.style.display = 'block';
            const ctxDist = document.getElementById('distChart').getContext('2d');
            if (distChart) distChart.destroy();
            distChart = new Chart(ctxDist, {
                type: 'pie',
                plugins: [ChartDataLabels],
                data: {
                    labels: Object.keys(payload.species),
                    datasets: [{
                        data: Object.values(payload.species),
                        backgroundColor: ['#00F2FE', '#FBBF24', '#10B981', '#6366F1', '#EC4899', '#F43F5E'],
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } },
                        datalabels: {
                            color: '#fff', font: { weight: 'bold', size: 10, family: 'Space Mono' },
                            formatter: (val, ctx) => {
                                const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return ((val / sum) * 100).toFixed(0) + '%';
                            }
                        }
                    }
                }
            });
        }

        // 2. CATEGORY DONUT CHART (BIOLOGICAL QUALITY)
        if (payload.categories) {
            const ctxCat = document.getElementById('catChart').getContext('2d');
            if (catChart) catChart.destroy();
            catChart = new Chart(ctxCat, {
                type: 'doughnut',
                plugins: [ChartDataLabels],
                data: {
                    labels: Object.keys(payload.categories),
                    datasets: [{
                        data: Object.values(payload.categories),
                        backgroundColor: ['#FBBF24', '#10B981', '#6366F1', '#64748B'], // Gold, Green, Indigo, Slate
                        borderWidth: 2, borderColor: 'rgba(5, 7, 10, 0.8)',
                        hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#64748B', font: { family: 'Space Mono', size: 10 }, padding: 15 } },
                        datalabels: {
                            color: '#fff', font: { weight: 'bold', size: 11, family: 'Space Mono' },
                            formatter: (val, ctx) => {
                                const sum = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                if (val === 0) return '';
                                return ((val / sum) * 100).toFixed(0) + '%';
                            }
                        }
                    }
                }
            });
        }

        // Ensure all panels are shown
        if (compPanel) compPanel.style.display = 'block';
        metricsPanel.style.display = 'block';

        // 3. FORENSIC KPI METRICS
        const avg = payload.updated / payload.items;
        const variance = ((payload.updated / payload.original) - 1) * 100;

        document.getElementById('kpiAvg').innerText = fmtElite.format(avg);
        document.getElementById('kpiMax').innerText = fmtElite.format(payload.max * (payload.updated / payload.original));
        document.getElementById('kpiVariance').innerText = `+${variance.toFixed(2)}%`;
        document.getElementById('kpiBaseYear').innerText = currentMode === 'ipc' ? '2018' : 'Valor Base';
    };

    window.generatePremiumPDF = async function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const resultsEl = currentMode === 'ipc' ? resultsUI : resultsAvaluo;

        EVA.toast('Generando reporte PDF... por favor espere', 'info');

        // --- FIXED: Temporary visibility for html2canvas ---
        const originalStyle = resultsEl.style.display;
        resultsEl.style.display = 'block';

        // Wait 100ms for browser to reflow/render
        await new Promise(r => setTimeout(r, 150));

        const canvas = await html2canvas(resultsEl, {
            backgroundColor: '#020408',
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false
        });

        resultsEl.style.display = originalStyle; // Revert

        const imgData = canvas.toDataURL('image/png');

        if (!imgData || imgData.length < 1000 || !imgData.startsWith('data:image/')) {
            EVA.toast('Error crítico: El motor de captura no pudo procesar la tabla.', 'error');
            return;
        }

        try {
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            doc.save(`Reporte_EVA_${new Date().toISOString().slice(0, 10)}.pdf`);
            EVA.toast('✓ Reporte PDF descargado correctamente');
        } catch (err) {
            console.error("PDF-Error: ", err);
            EVA.toast('Error al procesar el PDF: ' + err.message, 'error');
        }
    };

    // --- Chart Initialization ---
    if (eliteChartEl) {
        const ctx = eliteChartEl.getContext('2d');
        new Chart(ctx, {
            type: 'line',
            plugins: [ChartDataLabels],
            data: {
                labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
                datasets: [{
                    label: 'Factor Zenith Accum',
                    data: [1.0, 1.038, 1.075, 1.132, 1.258, 1.392, 1.481, 1.5226],
                    borderColor: '#00F2FE',
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    borderWidth: 2.5, tension: 0.4, fill: true, pointRadius: 4, pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        color: 'rgba(0, 242, 254, 0.8)',
                        anchor: 'end',
                        align: 'top',
                        offset: 4,
                        font: { family: 'Space Mono', size: 9, weight: 'bold' },
                        formatter: (val) => val.toFixed(3)
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } }
                }
            }
        });
    }
});

// Service Worker Registration & Version Check
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('[E.V.A. APP] SW registered:', reg.scope);

                // Handle version changes immediately
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New version has been cached
                            console.log('[E.V.A.] New content available, notifying UI...');
                        }
                    });
                });
            })
            .catch(err => console.warn('[E.V.A. APP] SW failed:', err));
    });
}

window.toggleCard = function (id) {
    const card = document.getElementById(id);
    if (card) {
        card.classList.toggle('collapsed');
        if (window.lucide) lucide.createIcons();
    }
};
