# E.V.A. | Experto en Valoración de Activos 🌲💻

![E.V.A. Version](https://img.shields.io/badge/Version-2.0.0--Elite-00F2FE.svg?style=for-the-badge&logo=appveyor)
![Status](https://img.shields.io/badge/Status-Production%20Ready-059669.svg?style=for-the-badge&logo=checkmarx)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

**E.V.A. (Experto en Valoración de Activos)** es una suite de herramientas desarrollada por [DGZ Engineering Lab](https://github.com/DGZ-Engineering-Lab) para resolver el cálculo de indexación de inflación (IPC) y la tasación de compensaciones forestales bajo matrices volumétricas masivas.

Automatiza la búsqueda tabular y compensación económica para decenas de especies en tiempo real, aplicando topologías matemáticas exactas y proporcionando interfaces preparadas para el copiado a nivel pericial.

## 🚀 Capacidades y Objetivos Principales

1. **Eficiencia Forense (Avalúo)**: Determinar el precio base comercial de los individuos maderables (según abarcadura y altura comercial) basado en los rangos de tasación categorizados (1ra, 2da, 3ra categoría).
2. **Retro-Indexación (IPC)**: Proyectar económicamente valores extraídos en 2018 hasta el cierre fiscal actual usando un factor multiplicador acumulativo (Factor Zenith `1.5226` capitalizado).
3. **Ergonomía Analítica (Copiado Seguro)**: Proveer una arquitectura de datos pura en Javascript que permita exportaciones directas hacia Excel o Word librándolas del colapso de celdas HTML, manteniendo los incrementos y matrices impecables.

## 📂 Arquitectura del Proyecto

El repositorio de E.V.A. ha sido depurado y estructurado bajo estándares profesionales *Modern Web* e Ingeniería de Software:

```text
E.V.A/
├── index.html                   # Homepage. Describe funcionalidad, módulos y visión institucional de DGZ.
├── app.html                     # Consola Maestra de Operaciones (Dual-Core Híbrido: IPC/Avalúo).
├── data/
│   └── act_ipc_data.json        # Base de datos en crudo (Vectores volumétricos / Matriz).
├── js/
│   └── avaluo_db.js             # Parser Engine JSON-to-JS. Integra el catálogo biológico/tasación.
├── docs/
│   ├── AVALUO_2026.XLSX         # Spreadsheet Base (Origen algorítmico y financiero de consulta).
│   └── formulas_*.txt           # Auditoría de queries base Excel INDEX/MATCH extraídos para trazabilidad.
├── LICENSE                      # Licencia MIT de libre distribución comercial/privada.
└── README.md                    # Manual del repositorio.
```

## 🔧 Flujo Dinámico en Producción

La herramienta está compuesta por una *UX Glassmorphism Premium* de alto contraste.
Los ingenieros operan en 2 modalidades primarias con intercambio "Single-Page":

1. **PROYECCIÓN IPC MASIVA**: 
   - Procesa bloques sin ordenar (*ej. $1,000,000.00*) y el Parser Interno extrae la variable neta matemática aplicando la multiplicación Zenith.
2. **CÁLCULO DE AVALÚO FORESTAL**: 
   - Se alimenta con texto separado por tabulaciones. `(Especie | Abarcadura | Altura)`
   - Genera automáticamente 2 tablas limpias: *Matriz Detallada* y un *Resumen de Proyección IPC Subtotalizado*.

## ⚙️ Stack Tecnológico

- **Frontend Core**: Vanilla JS ES6+, HTML5 Semántico, CSS3 moderno (Variables HSL/Hex, Modos de Fusión).
- **Styling**: `Hanken Grotesk` y `Space Mono` con integraciones paramétricas (Micro-Layouting Reactivo).
- **Librerías Adicionales**: Uso de *Lucide Icons* nativo para infografías. *Chart.js* para el Tracking DANE.
- **Serverless**: Completa incondicionalidad hacia bases de datos. Corre 100% sobre disco C:/ o local (Zero Server Latency).

---
**DGZ Engineering Lab** © 2026 - *Automatizando el Futuro del Catastro y el Peritaje Ambiental Maderable.* 🌍
