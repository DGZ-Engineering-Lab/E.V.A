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
    const ZENITH_FACTOR = 1.5226;
    const fmtElite = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    });
    let currentMode = 'ipc';
    let actParsedAvaluo = [];

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
                if (p.length < 3) errors.push(`Línea ${i+1}: Faltan datos (Especie | D | H)`);
                else if (isNaN(parseFloat(p[1].replace(',', '.')))) errors.push(`Línea ${i+1}: Diámetro inválido`);
            }
        });

        if (errors.length > 0) {
            validationMessage.innerHTML = `<i data-lucide="alert-circle" style="width:14px;"></i> ${errors[0]}`;
            validationMessage.className = 'v-body error';
        } else {
            validationMessage.innerHTML = `<i data-lucide="shield-check" style="width:14px;"></i> SINTAXIS_VÁLIDA (${lines.length} registros detectados)`;
            validationMessage.className = 'v-body';
        }
        lucide.createIcons();
    }

    window.saveToLedger = function(summary) {
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
            container.innerHTML = '<div class="empty-history">NO SE DETECTAN REGISTROS PREVIOS.</div>';
            return;
        }
        container.innerHTML = sessionLedger.map(item => `
            <div class="history-item" onclick="loadFromLedger(${item.id})">
                <div class="h-time">${item.date} ${item.time}</div>
                <div class="h-desc">${item.mode.toUpperCase()}: ${item.summary}</div>
            </div>
        `).join('');
    }

    window.loadFromLedger = function(id) {
        const item = sessionLedger.find(i => i.id === id);
        if (item) {
            sysInputArea.value = item.data;
            switchMode(item.mode);
            executeAction();
            EVA.toast('Sesión recuperada del Ledger');
        }
    };
    renderLedger(); // Initial load

    // --- Core Logic functions (Exported to window for legacy support if needed, 
    // but preferred via listeners) ---

    window.sanitizeText = function(str) {
        if (!str) return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    window.cleanVal = function(str) {
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

    window.switchMode = function(mode) {
        currentMode = mode;
        if (mode === 'ipc') {
            bIpc.classList.add('active'); bAva.classList.remove('active');
            bExec.innerHTML = '<i data-lucide="play"></i> EJECUTAR PROCESAMIENTO';
            bExec.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
            pTitle.innerText = 'CENTRO DE PROCESAMIENTO IPC';
            pIcon.style.color = 'var(--primary)';
            sysInputArea.placeholder = "> PEGAR VALORES PARA INDEXACIÓN...";
            resultsAvaluo.style.display = 'none';
        } else {
            bAva.classList.add('active'); bIpc.classList.remove('active');
            bExec.innerHTML = '<i data-lucide="zap"></i> CALCULAR AVALÚO GLOBAL';
            bExec.style.background = 'linear-gradient(135deg, var(--warning), #D97706)';
            pTitle.innerText = 'MOTOR DE VALORACIÓN BIOLÓGICA';
            pIcon.style.color = 'var(--warning)';
            sysInputArea.placeholder = "> PEGAR: ESPECIE | ABARC(cm) | ALT(m)...";
            resultsUI.style.display = 'none';
        }
        if (window.lucide) lucide.createIcons();
    };

    window.executeAction = function() {
        // Visual feedback on execution
        document.body.style.filter = 'brightness(1.1) contrast(1.1)';
        setTimeout(() => document.body.style.filter = 'none', 150);

        if (currentMode === 'ipc') executeZenith();
        else executeAvaluo();
    };

    window.clearInput = function() {
        sysInputArea.value = '';
        resultsUI.style.display = 'none';
        resultsAvaluo.style.display = 'none';
        validationPanel.style.display = 'none';
        document.getElementById('pdfBtn').style.display = 'none';
        distPanel.style.display = 'none';
        kpiCount.textContent = '0';
        localStorage.removeItem('evaInputData');
    };

    // --- High-End Notification System ---
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);

    window.EVA = {
        toast: function(msg, type = 'success', duration = 4000) {
            const toast = document.createElement('div');
            toast.className = `eva-toast ${type}`;
            
            // Icon mapping
            const iconMap = {
                'success': 'check-circle',
                'warning': 'alert-triangle',
                'error': 'shield-alert',
                'info': 'info'
            };
            const icon = iconMap[type] || 'bell';
            
            toast.innerHTML = `
                <i data-lucide="${icon}"></i> 
                <div class="toast-content">
                    <div style="font-weight:900; font-size:0.65rem; opacity:0.5; margin-bottom:4px; letter-spacing:1px;">SYSTEM_NOTICE // ${type.toUpperCase()}</div>
                    <span>${msg}</span>
                </div>
                <div class="toast-progress"></div>
            `;
            toastContainer.appendChild(toast);
            lucide.createIcons();

            // Animate progress bar
            const progressBar = toast.querySelector('.toast-progress');
            progressBar.style.transition = `transform ${duration}ms linear`;
            progressBar.style.transform = 'scaleX(1)';

            setTimeout(() => {
                toast.classList.add('active');
                setTimeout(() => {
                    progressBar.style.transform = 'scaleX(0)';
                }, 50);
            }, 10);

            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => toast.remove(), 600);
            }, duration);
        }
    };


    window.copyTable = async function(id) {
        const el = document.getElementById(id);
        
        // Use modern clipboard API if available
        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const blob = new Blob([el.outerHTML], { type: 'text/html' });
                const plainText = new Blob([el.innerText], { type: 'text/plain' });
                const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': plainText })];
                await navigator.clipboard.write(data);
                EVA.toast('Matriz copiada con formato (Excel compatible)');
            } catch (err) {
                // Fallback for some browsers
                copyLegacy(el);
            }
        } else {
            copyLegacy(el);
        }
    };

    function copyLegacy(el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        try {
            document.execCommand('copy');
            EVA.toast('Matriz copiada al portapapeles');
        } catch (err) {
            EVA.toast('Error al copiar', 'warning');
        }
        selection.removeAllRanges();
    }

    window.exportTableToCSV = function(tableId, filename) {
        const table = document.getElementById(tableId);
        let csv = [];
        const rows = table.querySelectorAll('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const row = [], cols = rows[i].querySelectorAll('td, th');
            for (let j = 0; j < cols.length; j++) {
                let text = cols[j].innerText;
                // Clean currency and special chars for CSV
                if (cols[j].classList.contains('num')) {
                    text = text.replace(/[$. ]/g, '').replace(',', '.');
                }
                row.push('"' + text.replace(/"/g, '""') + '"');
            }
            csv.push(row.join(';')); // semicolon for better Excel/South America compatibility
        }

        const csvContent = "\uFEFF" + csv.join('\n'); // UTF-8 BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename + ".csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        EVA.toast('Archivo CSV generado con éxito');
    };

    window.exportTableToExcel = function(tableId, filename) {
        // Keeping legacy XLS for specific formatting needs but recommending CSV
        const table = document.getElementById(tableId);
        const cloneTable = table.cloneNode(true);
        const originalSelects = table.querySelectorAll('select');
        const clonedSelects = cloneTable.querySelectorAll('select');
        for(let i = 0; i < originalSelects.length; i++) {
            clonedSelects[i].parentNode.innerText = originalSelects[i].value;
        }

        const html = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="UTF-8">
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>${filename}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
            <style>td { mso-number-format:"\\@"; }</style>
            </head>
            <body><table border="1">${cloneTable.innerHTML}</table></body>
            </html>
        `;

        const blob = new Blob([html], { type: "application/vnd.ms-excel" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", filename + ".xls");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        EVA.toast('Exportando XLS... Verifique advertencia de Office', 'warning');
    };

    function executeZenith() {
        const txt = sysInputArea.value;
        if (!txt.trim()) return;
        const lines = txt.split('\n');
        const tbody = document.getElementById('eliteBody');
        tbody.innerHTML = ''; let count = 0;

        lines.forEach((line) => {
            const parts = line.split(/\t|\s{2,}/).filter(p => p.trim().length > 0);
            const tags = (parts.length === 4) ? [' (40%)', ' (60%)', ' (70%)', ' (100%)'] : ['', '', '', ''];

            parts.forEach((part, idx) => {
                const val = cleanVal(part);
                if (val > 0) {
                    count++;
                    const updated = Math.round(val * ZENITH_FACTOR);
                    const delta = updated - val;
                    const tag = tags[idx] || '';
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="num">#ZEN_${count.toString().padStart(3, '0')}${tag}</td>
                        <td class="num">${fmtElite.format(val)}</td>
                        <td class="num upd">${fmtElite.format(updated)}</td>
                        <td class="num"><span class="delta">+ ${fmtElite.format(delta)}</span></td>
                    `;
                    tbody.appendChild(row);
                }
            });
        });

        if (count > 0) {
            resultsUI.style.display = 'block';
            document.getElementById('pdfBtn').style.display = 'block';
            kpiCount.textContent = count;
            if (window.lucide) lucide.createIcons();
            window.scrollTo({ top: resultsUI.offsetTop - 100, behavior: 'smooth' });
            EVA.toast(`${count} registros procesados`);
            saveToLedger(`${count} registros IPC`);
        }
    }

    window.showCustomAlert = function(speciesArray) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const html = `
            <div class="modal-box">
                <div class="modal-title">
                    <i data-lucide="triangle-alert"></i> SIN REGISTRO EN BASE DE DATOS
                </div>
                <div class="modal-body">
                    Se detectaron <strong>${speciesArray.length}</strong> especie(s) ajena(s) a la matriz central. Se les ha asignado la categoría "Tercera" por defecto para no frenar la liquidación.
                    <ul class="modal-list">
                        ${speciesArray.map(s => `<li>${s}</li>`).join('')}
                    </ul>
                    💡 TIP: Puedes actualizar la categoría exacta de estas especies usando el selector desplegable <span style="color:var(--warning);">amarillo</span> directamente en la tabla de detalles. La inteligencia financiera se recalculará automáticamente.
                </div>
                <button class="modal-btn" onclick="this.closest('.modal-overlay').remove()">ENTENDIDO · CONTINUAR</button>
            </div>
        `;
        
        overlay.innerHTML = html;
        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons(); 
        
        setTimeout(() => overlay.classList.add('active'), 10);
    };

    window.updateRowCat = function(id, newCat) {
        const rowIdx = actParsedAvaluo.findIndex(r => r.id === id);
        if (rowIdx > -1) {
            actParsedAvaluo[rowIdx].typeNorm = newCat;
            renderAvaluoBoard(false);
            EVA.toast(`Categoría actualizada a ${newCat}`);
        }
    };

    function renderAvaluoBoard(showAlerts = false) {
        const tbody = document.getElementById('avaluoBody');
        const tbodySum = document.getElementById('avaluoSummaryBody');
        tbody.innerHTML = ''; tbodySum.innerHTML = '';

        let count = 0, s40 = 0, s60 = 0, s70 = 0, s100 = 0;
        const unknownSpecies = [];

        actParsedAvaluo.forEach(item => {
            const { id, esp, ab, alt, isUnknown, typeNorm } = item;
            const validType = typeNorm === 'Selección' ? 'Primera' : typeNorm;

            const t = AVALUO_DB[validType] || AVALUO_DB.Tercera;
            const abM = ab / 100;
            let cI = t.Cols.findIndex(c => c >= abM); if (cI === -1) cI = t.Cols.length - 2;
            let rI = t.Rows.findIndex(r => r >= alt); if (rI === -1) rI = t.Rows.length - 1;
            let base = t.Data[rI][cI] || 0;

            if (typeNorm === 'Selección') base = Math.round(base * 1.2);

            const v40 = base, v60 = (base * 60) / 40, v70 = (base * 70) / 40, v100 = (base * 100) / 40;
            s40 += v40; s60 += v60; s70 += v70; s100 += v100;
            count++;

            if (isUnknown && showAlerts) unknownSpecies.push(esp);

            const sel1 = typeNorm === 'Primera' ? 'selected' : '';
            const sel2 = typeNorm === 'Segunda' ? 'selected' : '';
            const sel3 = typeNorm === 'Tercera' ? 'selected' : '';
            const selS = typeNorm === 'Selección' ? 'selected' : '';

            let catHTML = `<td>
                <select class="cat-select" onchange="updateRowCat(${id}, this.value)" title="Modificar Categoría" ${!isUnknown ? 'style="border-color:rgba(255,255,255,0.1); color:var(--text-dim); background:transparent;"' : ''}>
                    <option value="Primera" ${sel1}>Primera</option>
                    <option value="Segunda" ${sel2}>Segunda</option>
                    <option value="Tercera" ${sel3}>Tercera</option>
                    <option value="Selección" ${selS}>Selección</option>
                </select>
            </td>`;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight:900; color:${isUnknown ? 'var(--warning)' : 'var(--text-main)'};">${esp} ${isUnknown && showAlerts ? '<span style="font-size:0.65rem; opacity:0.7; display:block;">⚠ SIN_REGISTRO</span>' : ''}</td>
                ${catHTML}
                <td class="num">${ab}</td>
                <td class="num">${alt}</td>
                <td class="num">${fmtElite.format(v40)}</td>
                <td class="num">${fmtElite.format(v60)}</td>
                <td class="num">${fmtElite.format(v70)}</td>
                <td class="num">${fmtElite.format(v100)}</td>
            `;
            tbody.appendChild(row);
        });


        if (unknownSpecies.length > 0 && showAlerts) {
            showCustomAlert([...new Set(unknownSpecies)]);
        }

        if (count > 0) {
            const speciesData = {};
            const sums = [{ l: "Valor Base (40%)", b: s40 }, { l: "Valor al 60%", b: s60 }, { l: "Valor al 70%", b: s70 }, { l: "Valor al 100%", b: s100 }];
            
            // Collect analytics
            actParsedAvaluo.forEach(item => {
                speciesData[item.esp] = (speciesData[item.esp] || 0) + 1;
            });

            sums.forEach(s => {
                const proyectado = Math.round(s.b * ZENITH_FACTOR);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="font-weight:900;">${s.l.toUpperCase()}</td>
                    <td class="num">${fmtElite.format(s.b)}</td>
                    <td class="num upd">${fmtElite.format(proyectado)}</td>
                    <td class="num"><span class="delta">+ ${fmtElite.format(proyectado - s.b)}</span></td>
                `;
                tbodySum.appendChild(row);
            });
            resultsAvaluo.style.display = 'block';
            document.getElementById('pdfBtn').style.display = 'block';
            kpiCount.textContent = count;
            if (window.lucide) lucide.createIcons();

            updateLiveAnalytics(speciesData);

            if (showAlerts) {
                window.scrollTo({ top: resultsAvaluo.offsetTop - 100, behavior: 'smooth' });
                EVA.toast(`Avalúo completado: ${count} individuos`);
                saveToLedger(`${count} árboles tasados`);
            }
        }
    }

    function executeAvaluo() {
        const txt = sysInputArea.value;
        if (!txt.trim()) return;
        const lines = txt.split('\n');

        if (typeof AVALUO_DB === 'undefined') { EVA.toast('Error: Base de datos no cargada', 'warning'); return; }

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
                let spL = esp.toLowerCase().trim();
                let isUnknown = false;

                const directCategories = ['selección', 'seleccion', 'primera', 'segunda', 'tercera'];
                if (directCategories.includes(spL)) {
                    type = spL === 'seleccion' ? 'Selección' : esp.charAt(0).toUpperCase() + esp.slice(1).toLowerCase();
                } else {
                    for (let s of AVALUO_DB.Species) {
                        if (s.Name.toLowerCase().trim() === spL) {
                            type = s.Type;
                            break;
                        }
                    }
                }

                if (!type) {
                    isUnknown = true;
                    type = "Tercera"; 
                }

                const typeNorm = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

                actParsedAvaluo.push({
                    id: rowIdCounter++, esp, ab, alt, isUnknown, typeNorm
                });
            }
        });

        renderAvaluoBoard(true);
    }

    // --- Interaction Engine ---
    let ticking = false;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    document.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const { clientX, clientY } = e;
                // Magnetic Sidebar Items (Only for desktop)
                if (!isMobile) {
                    document.querySelectorAll('.nav-item').forEach(item => {
                        const rect = item.getBoundingClientRect();
                        const dist = Math.hypot(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
                        if (dist < 100) {
                            const x = (clientX - (rect.left + rect.width / 2)) * 0.4;
                            const y = (clientY - (rect.top + rect.height / 2)) * 0.4;
                            item.style.transform = `translate(${x}px, ${y}px) scale(1.15)`;
                        } else {
                            item.style.transform = `translate(0,0) scale(1)`;
                        }
                    });
                }
                // Parallax Background
                document.body.style.backgroundPosition = `${clientX * 0.01}% ${clientY * 0.01}%`;
                ticking = false;
            });
            ticking = true;
        }
    });

    // 3D Tilt Optimization: Disable on mobile to save battery
    if (!isMobile) {
        const interactibles = document.querySelectorAll('.glass-card:not(.results-wrapper .glass-card), .kpi-stack');
        interactibles.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const rotateX = (y - 0.5) * 8;
                const rotateY = (x - 0.5) * -8;
                el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.3), 0 0 20px var(--primary-glow)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
                el.style.boxShadow = `0 10px 40px rgba(0,0,0,0.2)`;
            });
        });
    }

    // --- Phase 3: Live Analytics Dashboard ---
    let distChart = null;
    const distPanel = document.getElementById('distPanel');

    window.updateLiveAnalytics = function(data, type = 'pie') {
        distPanel.style.display = 'block';
        const ctx = document.getElementById('distChart').getContext('2d');
        
        if (distChart) distChart.destroy();
        
        const labels = Object.keys(data);
        const values = Object.values(data);

        distChart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#00F2FE', '#FBBF24', '#10B981', '#6366F1', '#EC4899', '#F43F5E'
                    ],
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { position: 'bottom', labels: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } } 
                }
            }
        });
    };

    window.generatePremiumPDF = async function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const resultsEl = currentMode === 'ipc' ? resultsUI : resultsAvaluo;
        
        EVA.toast('Generando reporte forense...', 'info');
        
        const canvas = await html2canvas(resultsEl, {
            backgroundColor: '#020408',
            scale: 2
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`REPORTE_FORENSE_EVA_${Date.now()}.pdf`);
        EVA.toast('PDF generado con éxito');
    };

    // --- Chart Initialization ---
    if (eliteChartEl) {
        const ctx = eliteChartEl.getContext('2d');
        new Chart(ctx, {
            type: 'line',
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
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748B', font: { family: 'Space Mono', size: 10 } } }
                }
            }
        });
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('[E.V.A. APP] SW registered:', reg.scope))
            .catch(err => console.warn('[E.V.A. APP] SW failed:', err));
    });
}
