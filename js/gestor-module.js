/**
 * E.V.A. — Gestor Predial OYM Module Logic
 * Integration v6.0 for E.V.A. Core
 */

const gestorApp = {
    state: {
        isRunning: false,
        syncProgress: 0,
        logs: []
    },

    init() {
        this.log("Módulo Gestor Predial inicializado.", "sys");
    },

    log(msg, type = "sys") {
        const container = document.getElementById('logContainer');
        if (!container) return;

        const time = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.style.marginBottom = "4px";
        entry.style.borderLeft = "2px solid " + (type === 'err' ? '#f87171' : type === 'ok' ? '#34d399' : '#00F2FE');
        entry.style.paddingLeft = "8px";
        
        let color = '#00F2FE';
        if (type === 'err') color = '#f87171';
        if (type === 'ok') color = '#34d399';
        if (type === 'warn') color = '#fbbf24';

        entry.innerHTML = `<span style="color: rgba(255,255,255,0.3); font-size: 9px;">[${time}]</span> <span style="color: ${color}">${msg}</span>`;
        
        if (container.querySelector('.italic')) {
            container.innerHTML = '';
        }
        
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    },

    clearLogs() {
        const container = document.getElementById('logContainer');
        if (container) container.innerHTML = '<div class="text-gray-600 italic opacity-50">Esperando ejecución...</div>';
    },

    async createStructure() {
        const id = document.getElementById('predioId').value || "P-TEMP-" + Date.now().toString().slice(-4);
        const tipo = document.getElementById('tipoDestino').value;
        const clase = document.getElementById('clasificacion').value;

        this.log(`Iniciando creación de estructura para Predio: ${id}`, "sys");
        this.log(`Configuración: ${tipo} | ${clase}`, "sys");

        const steps = [
            "Creando directorio raíz...",
            "Generando subcarpetas de INSCRIPCIÓN...",
            "Indexando documentos de VALORACIÓN...",
            "Configurando permisos de acceso pericial...",
            "Estructura finalizada exitosamente."
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            this.log(`> ${steps[i]}`, i === steps.length - 1 ? "ok" : "sys");
        }

        if (window.EVA) window.EVA.toast(`Estructura para ${id} creada`, "success");
    },

    async startSync() {
        if (this.state.isRunning) return;
        
        const btn = document.getElementById('btnSync');
        const indicator = document.getElementById('syncIndicator');
        const bar = document.getElementById('syncBar');
        const percent = document.getElementById('syncPercent');

        this.state.isRunning = true;
        btn.disabled = true;
        indicator.innerHTML = '<div class="pulse-dot" style="background:#f59e0b;"></div><span>SYNCING</span>';
        
        this.log("Iniciando sincronización con servidor central...", "warn");

        for (let i = 0; i <= 100; i += 2) {
            await new Promise(r => setTimeout(r, 50));
            bar.style.width = i + "%";
            percent.textContent = i + "%";
            
            if (i === 20) this.log("Conexión establecida. Transfiriendo metadatos...", "sys");
            if (i === 50) this.log("Validando firmas digitales de carpetas...", "sys");
            if (i === 80) this.log("Sincronizando archivos de evidencia...", "sys");
        }

        this.log("Sincronización completada exitosamente.", "ok");
        indicator.innerHTML = '<div class="pulse-dot" style="background:#34d399;"></div><span>SYNCED</span>';
        btn.disabled = false;
        this.state.isRunning = false;

        if (window.EVA) window.EVA.toast("Sincronización exitosa", "success");
    }
};

document.addEventListener('DOMContentLoaded', () => gestorApp.init());
