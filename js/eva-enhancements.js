/**
 * E.V.A. PRO — Enhancement Module v2.0
 * DGZ Engineering Lab × Antigravity Engine © 2026
 * 
 * Features:
 *   - Dynamic IPC Year Selection (2010-2025)
 *   - Global Keyboard Shortcuts
 *   - Drag & Drop Data Import
 *   - Fuzzy Species Matching Engine
 *   - Command Palette (Ctrl+K)
 *   - Column Visibility Management (CSS Injection)
 *   - Intelligence Insight Modal (showTrace)
 */

const IPC_DANE_DATA = {
    rates: {
        2010: 3.17, 2011: 3.73, 2012: 2.44, 2013: 1.94,
        2014: 3.66, 2015: 6.77, 2016: 5.75, 2017: 4.09,
        2018: 3.18, 2019: 3.80, 2020: 1.61, 2021: 5.62,
        2022: 13.12, 2023: 9.28, 2024: 5.20, 2025: 5.10
    },
    index: {
        2010: 0.7342, 2011: 0.7617, 2012: 0.7803, 2013: 0.7954,
        2014: 0.8245, 2015: 0.8804, 2016: 0.9311, 2017: 0.9692,
        2018: 1.0000, 2019: 1.0380, 2020: 1.0750, 2021: 1.1320,
        2022: 1.2580, 2023: 1.3920, 2024: 1.4810, 2025: 1.5226
    }
};

function computeIPCFactor(fromYear, toYear) {
    const fromIdx = IPC_DANE_DATA.index[fromYear];
    const toIdx = IPC_DANE_DATA.index[toYear];
    return (fromIdx && toIdx) ? toIdx / fromIdx : 1.0;
}

function getSelectedYears() {
    const fromEl = document.getElementById('ipcYearFrom');
    const toEl = document.getElementById('ipcYearTo');
    return {
        from: fromEl ? parseInt(fromEl.value) : 2018,
        to: toEl ? parseInt(toEl.value) : 2025
    };
}

window.IPC_DANE_DATA = IPC_DANE_DATA;
window.computeIPCFactor = computeIPCFactor;
window.getSelectedYears = getSelectedYears;
window.ZENITH_FACTOR = 1.5226;

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════
    //  1. DYNAMIC IPC ENGINE
    // ═══════════════════════════════════════════
    const yearFrom = document.getElementById('ipcYearFrom');
    const yearTo = document.getElementById('ipcYearTo');

    function updateDynamicFactor() {
        const years = getSelectedYears();
        const factor = computeIPCFactor(years.from, years.to);
        window.ZENITH_FACTOR = factor;

        const kpiDisplay = document.getElementById('kpiFactorDisplay');
        if (kpiDisplay) {
            kpiDisplay.textContent = factor.toFixed(4);
            kpiDisplay.style.color = factor >= 1 ? 'var(--primary)' : '#f43f5e';
        }

        const outcomePct = document.getElementById('outcomePercent');
        if (outcomePct) {
            const pct = ((factor - 1) * 100);
            outcomePct.textContent = `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
        }

        const ths = [
            ['thIpcBaseYear', `Valor Base IPC ${years.from}`],
            ['thIpcTargetYear', `Valor IPC ${years.to}`],
            ['thAvalBaseYear', `Valor Base IPC ${years.from}`],
            ['thAvalTargetYear', `Valor IPC ${years.to}`]
        ];
        ths.forEach(([id, text]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        });

        if (typeof updateIPCChart === 'function') updateIPCChart(years.from, years.to);
        if (typeof executeAction === 'function' && document.getElementById('mainInput')?.value.trim()) executeAction();
    }

    if (yearFrom) yearFrom.addEventListener('change', updateDynamicFactor);
    if (yearTo) yearTo.addEventListener('change', updateDynamicFactor);

    // ═══════════════════════════════════════════
    //  2. KEYBOARD & IMPORT
    // ═══════════════════════════════════════════
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); if (typeof executeAction === 'function') executeAction(); }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); if (typeof saveSessionFile === 'function') saveSessionFile(); }
        if (e.ctrlKey && e.key === 'k') { e.preventDefault(); toggleCommandPalette(); }
        if (e.key === 'Escape') { 
            const cp = document.getElementById('cmd-palette-overlay');
            if (cp) cp.remove();
            const modal = document.getElementById('traceModal');
            if (modal) modal.remove();
        }
    });

    // ═══════════════════════════════════════════
    //  3. BOTANICAL MAPPING & FUZZY SEARCH
    // ═══════════════════════════════════════════
    const SCIENTIFIC_MAP = {
        "Abarco": "Cariniana pyriformis", "Acacia": "Acacia mangium", "Aceite maría": "Calophyllum brasiliense",
        "Aceituno": "Vitex cymosa", "Aguacate": "Persea americana", "Algarrobo": "Hymenaea courbaril",
        "Aliso": "Alnus acuminata", "Arrayán": "Myrcianthes leucoxyla", "Balaustre": "Centrolobium paraense",
        "Balso": "Ochroma pyramidale", "Caoba": "Swietenia macrophylla", "Campano": "Samanea saman",
        "Caracoli": "Anacardium excelsum", "Carbonero": "Calliandra pittieri", "Carito": "Enterolobium cyclocarpum",
        "Cedro": "Cedrela odorata", "Cedro amargo": "Cedrela odorata", "Cedro negro": "Juglans neotropica",
        "Cedro espinoso": "Pachira quinata", "Ceiba": "Ceiba pentandra", "Ceiba amarilla": "Hura crepitans",
        "Ceiba tolúa": "Pachira quinata", "Chachajo": "Aniba perutilis", "Chagualo": "Myrsine guianensis",
        "Chapo": "Cedrelinga cateniformis", "Chaquiro": "Podocarpus oleifolius", "Chicalá": "Tecoma stans",
        "Chiminango": "Pithecellobium dulce", "Ciprés": "Cupressus lusitanica", "Comino": "Aniba perutilis",
        "Diomate": "Astronium graveolens", "Ébano": "Libidibia ebano", "Encenillo": "Weinmannia tomentosa",
        "Eucalipto": "Eucalyptus globulus", "Fresno": "Fraxinus chinensis", "Gualanday": "Jacaranda caucana",
        "Guamo": "Inga sp.", "Guayacán": "Handroanthus chrysanthus", "Guayacán rosado": "Tabebuia rosea",
        "Higuerón": "Ficus sp.", "Hobo": "Spondias mombin", "Indio desnudo": "Bursera simaruba",
        "Jagua": "Genipa americana", "Jobo": "Spondias mombin", "Laurel": "Cordia alliodora",
        "Leucaena": "Leucaena leucocephala", "Macondo": "Cavanillesia platanifolia", "Mango": "Mangifera indica",
        "Matarratón": "Gliricidia sepium", "Melina": "Gmelina arborea", "Moncoro": "Cordia gerascanthus",
        "Nazareno": "Peltogyne paniculata", "Nogal": "Juglans neotropica", "Ocobo": "Handroanthus roseus",
        "Orejero": "Enterolobium cyclocarpum", "Palma": "Ceroxylon quindiuense", "Pino": "Pinus patula",
        "Pino pátula": "Pinus patula", "Pino real": "Retrophyllum rospigliosii", "Roble": "Quercus humboldtii",
        "Roble amarillo": "Handroanthus chrysanthus", "Roble morado": "Tabebuia rosea", "Samán": "Samanea saman",
        "Sietecueros": "Tibouchina lepidota", "Teca": "Tectona grandis", "Urapán": "Fraxinus udhei",
        "Zapote": "Matisia cordata", "Iguá": "Albizia guachapele", "Tangare": "Carapa guianensis",
        "Sajo": "Campnosperma panamense", "Búcaró": "Erythrina fusca", "Café": "Coffea arabica",
        "Guayabo": "Psidium guajava", "Mamoncillo": "Melicoccus bijugatus", "Oiti": "Licania tomentosa"
    };

    function levenshtein(a, b) {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++)
            for (let j = 1; j <= n; j++)
                dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));
        return dp[m][n];
    }

    window.findSpeciesFuzzy = function(name) {
        if (!AVALUO_DB?.Species) return { type: 'Tercera', isUnknown: true, matchedName: null, scientific: "" };
        const input = name.toLowerCase().trim();
        
        // Exact category bypass
        const cats = { 'selección': 'Selección', 'seleccion': 'Selección', 'primera': 'Primera', 'segunda': 'Segunda', 'tercera': 'Tercera' };
        if (cats[input]) return { type: cats[input], isUnknown: false, matchedName: cats[input], scientific: "" };

        // 1. Direct Map Check
        for (let key in SCIENTIFIC_MAP) {
            if (key.toLowerCase() === input) {
                const dbMatch = AVALUO_DB.Species.find(s => s.Name.trim().toLowerCase() === input);
                return { type: dbMatch?.Type || 'Tercera', isUnknown: !dbMatch, matchedName: key, scientific: SCIENTIFIC_MAP[key] };
            }
        }

        // 2. Starts/Contains logic
        for (let s of AVALUO_DB.Species) {
            const dbN = s.Name.trim();
            const dbL = dbN.toLowerCase();
            if (dbL.includes(input) || input.includes(dbL)) {
                return { type: s.Type, isUnknown: false, matchedName: dbN, scientific: SCIENTIFIC_MAP[dbN] || s.Scientific || "" };
            }
        }

        // 3. Levenshtein
        let best = null, minD = 3;
        AVALUO_DB.Species.forEach(s => {
            const d = levenshtein(input, s.Name.toLowerCase().trim());
            if (d < minD) { minD = d; best = s; }
        });

        if (best) {
            const n = best.Name.trim();
            return { type: best.Type, isUnknown: false, matchedName: n, scientific: SCIENTIFIC_MAP[n] || best.Scientific || "" };
        }

        return { type: 'Tercera', isUnknown: true, matchedName: null, scientific: "" };
    };

    // ═══════════════════════════════════════════
    //  4. COLUMN VISIBILITY (CSS Injection)
    // ═══════════════════════════════════════════
    const avaluoCols = [
        { id: 'esp', label: 'Especie', class: 'col-esp', default: true },
        { id: 'sci', label: 'Científico', class: 'col-sci', default: true },
        { id: 'cat', label: 'Categoría', class: 'col-cat', default: true },
        { id: 'ab', label: 'DAP', class: 'col-ab', default: true },
        { id: 'alt', label: 'Altura', class: 'col-alt', default: true },
        { id: 'v40', label: '$ 40%', class: 'col-v40', default: true },
        { id: 'v60', label: '$ 60%', class: 'col-v60', default: false },
        { id: 'v70', label: '$ 70%', class: 'col-v70', default: false },
        { id: 'v100', label: '$ Final', class: 'col-v100', default: true }
    ];

    let styleEl = document.createElement('style');
    styleEl.id = 'eva-dynamic-cols';
    document.head.appendChild(styleEl);

    window.toggleColumnVisibility = function(cls, show) {
        if (!window.colState) window.colState = {};
        window.colState[cls] = show;
        const css = Object.entries(window.colState).filter(([_, v]) => !v).map(([c]) => `.${c} { display: none !important; }`).join('\n');
        styleEl.textContent = css;
    };

    function initColSelector() {
        const list = document.getElementById('colSelectorList');
        const btn = document.getElementById('btnColSelector');
        const menu = document.getElementById('colSelectorMenu');
        if (!list || !btn) return;

        list.innerHTML = avaluoCols.map(c => `
            <label class="column-opt">
                <input type="checkbox" data-class="${c.class}" ${c.default ? 'checked' : ''}>
                <span>${c.label}</span>
            </label>
        `).join('');

        btn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('active'); };
        document.onclick = () => menu.classList.remove('active');
        menu.onclick = (e) => e.stopPropagation();

        list.querySelectorAll('input').forEach(i => {
            i.onchange = () => toggleColumnVisibility(i.dataset.class, i.checked);
        });

        avaluoCols.forEach(c => toggleColumnVisibility(c.class, c.default));
    }

    // ═══════════════════════════════════════════
    //  5. INTELLIGENCE MODAL (showTrace)
    // ═══════════════════════════════════════════
    const treeImgs = {
        'abarco': 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=600',
        'cedro': 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600',
        'ceiba': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600',
        'roble': 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=600',
        'pino': 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600'
    };

    window.showTrace = function(data) {
        const nameMatch = data.match(/Especie:\s*([^(\n]+)/);
        const name = nameMatch ? nameMatch[1].trim() : 'Árbol';
        const key = name.split(' ')[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
        const sciMatch = data.match(/\(([^)]+)\)/);
        const sci = sciMatch ? sciMatch[1] : 'N/A';
        const img = treeImgs[key] || 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=600';

        const html = `
            <div id="traceModal" class="modal-overlay active" style="z-index:99999; display:flex; align-items:center; justify-content:center; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); backdrop-filter:blur(10px);">
                <div class="glass-card" style="width:500px; padding:0; overflow:hidden; border:1px solid rgba(0,242,254,0.3); animation:reveal 0.3s ease-out;">
                    <div style="height:200px; position:relative;">
                        <img src="${img}" style="width:100%; height:100%; object-fit:cover; opacity:0.8;">
                        <div style="position:absolute; bottom:0; left:0; width:100%; padding:1.5rem; background:linear-gradient(transparent, #0a0f1e);">
                            <h2 style="margin:0; font-size:1.5rem; color:#fff;">${name}</h2>
                            <p style="margin:0; color:var(--primary); font-style:italic; font-size:0.9rem;">${sci}</p>
                        </div>
                        <button onclick="document.getElementById('traceModal').remove()" style="position:absolute; top:15px; right:15px; border:none; background:rgba(0,0,0,0.3); color:#fff; border-radius:50%; width:30px; height:30px; cursor:pointer;">✕</button>
                    </div>
                    <div style="padding:1.5rem;">
                        <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:1rem; font-family:'Space Mono'; font-size:0.8rem; color:#cbd5e1; line-height:1.6;">
                            ${data.split('\n').map(l => `<div>• ${l}</div>`).join('')}
                        </div>
                        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">
                            <button onclick="document.getElementById('traceModal').remove()" class="action-btn" style="padding:8px 20px;">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    };

    // ═══════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════
    initColSelector();
    updateDynamicFactor();
    console.log('[E.V.A. PRO] Enhancement Engine v2.0 READY');
});
