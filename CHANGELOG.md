# Changelog

All notable changes to **E.V.A.** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
