# Changelog

All notable changes to **E.V.A.** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] — 2026-04-27

### Added

- **Preloader Sofisticado**: Sistema de carga técnica con animaciones de shimmer y barra de progreso para mejorar la percepción de rendimiento durante la inicialización de bases de datos masivas.
- **Estética Obsidian Premium**: Implementación de texturas de ruido orgánico, glassmorphism avanzado (saturación 180%) y scrollbars ultra-delgados con efectos de brillo.
- **Selector de Columnas Grid**: Rediseño del menú de visibilidad de columnas a un formato de rejilla compacta de dos columnas con controles personalizados de alta resolución.
- **Sanitización de Datos Forenses**: Limpieza profunda de codificación en la base de datos de especies (`avaluo_db.js`), eliminando artefactos de caracteres especiales para reportes profesionales.

### Fixed

- **Motor de Gráficos (eliteChart)**: Restaurada la funcionalidad de renderizado de analíticas IPC con degradados dinámicos y puntos de anclaje de precisión.
- **Optimización de Carga Crítica**: Implementación de `defer` en el pipeline de scripts y carga asíncrona de recursos para eliminar bloqueos de renderizado (FCP optimizado).
- **Consistencia Visual**: Unificación de estados hover y escalas en el sistema de Bento Grid.

## [3.3.0] — 2026-04-21

### Added

- **Editor de Tabla IPC**: Nueva interfaz modal para modificar valores del IPC (DANE) dinámicamente y guardarlos localmente. Permite indexar contra cualquier año base/destino personalizado.
- **Soporte de Cantidades**: Se permite ingresar la cantidad de individuos en la entrada de datos (ej: `Especie | DAP | Altura | Cantidad`). El motor multiplica automáticamente los valores base e indexados.
- **Bio-Validación Preventiva**: Algoritmo de detección de anomalías biológicas que resalta registros con dimensiones atípicas (DAP > 200cm o Altura > 45m) para prevenir errores de digitación.
- **Exportación Excel Nativa (.xlsx)**: Integración de **SheetJS** para generar archivos Excel reales con celdas numéricas y anchos de columna automáticos.
- **Columna de Cantidad**: Nueva columna visible en la tabla de detalle y selector de columnas.

## [3.2.0] — 2026-04-21

### Added

- **Columnas Base vs IPC**: La tabla de detalle del avalúo forestal ahora muestra valores **base sin indexar** (Base 40%, 60%, 70%, 100%) junto a los **valores indexados por IPC** (IPC 40%, 60%, 70%, 100%) en columnas separadas.
- **Selector de Columnas Ampliado**: El menú de visibilidad de columnas incluye las 8 columnas de valor con visibilidad configurable.
- **Transparencia Pericial**: Los valores base ahora coinciden exactamente con las tablas de referencia oficial del IGAC/DANE, permitiendo auditoría directa contra los valores históricos.

### Changed

- Encabezados de tabla renombrados: `Val 40%` → `Base 40%` + `IPC 40%` para claridad pericial.
- Tabla resumen mantiene la estructura original: Valor Base | Valor IPC Indexado | Incremento %.

## [3.1.0] — 2026-03-31

### Added

- **Auto-Update HUD**: Real-time version polling with GitHub Pages synchronization and safe-reload backup.
- **Biological Quality Matrix**: New doughnut chart in analytics for tree category distribution.
- **Combined Multi-Table Export**: Simultaneous export/copy of detail and summary tables with maintained formatting.
- **Enhanced Data Labels**: Visual data points added to the IPC Evolution (eliteChart) for forensic precision.
- **Enterprise Documentation**: Professional README overhaul with technical architecture and dynamic badges.

## [3.0.0] — 2026-03-30

### Added

- **Smart-Input Linter**: Real-time syntax validation for IPC and Avalúo data entries.
- **Forensic Session Ledger**: Persistent history of calculations stored locally with instant retrieval.
- **Dynamic Category Overrides**: Ability to manually adjust tree categories in real-time with automatic value updates.
- **Live Analytics Dashboard**: Real-time distribution charts for species valuation.
- **Integrated PDF Reporting**: Generate professional forensic reports directly from the app.
- **Optimized Service Worker**: Enhanced offline-first performance with explicit cache management.

## [2.5.1] — 2026-03-27

### Changed

- Unified animation curve to `cubic-bezier(0.23, 1, 0.32, 1)` across all interfaces
- Optimized light theme contrast (`--text-main: #020617`, `--bg-panel: 95% opacity`)
- Upgraded zenith theme text legibility (`--text-dim: #CBD5E1`)
- Replaced `transition: all` with targeted property transitions for performance
- Added `will-change` and `translateZ(0)` GPU hints on interactive elements

### Fixed

- Multi-value IPC input parsing (tab/space separated rows)
- Theme switching text contrast loss on Arctic and Zenith modes

## [2.0.0] — 2026-03-24

### Added

- Dual-mode console (IPC + Forest Appraisal) with single-page switching
- Glassmorphism UI with 5-theme engine (Dark, Light, Zenith, Forest, Minimal)
- Species database with 70+ Colombian tree entries
- Chart.js IPC historical evolution visualization
- Persistent theme selection via `localStorage`
- Chart.js automatic color sync on theme change

### Changed

- Migrated from single-file to modular architecture (`css/`, `js/`, `data/`)
- Replaced inline styles with CSS custom properties system

## [1.0.0] — 2026-03-20

### Added

- Initial release: IPC indexation calculator
- Forest appraisal engine with volumetric matrix
- Basic dark theme
- Copy-to-clipboard functionality for result tables
