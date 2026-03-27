# Changelog

All notable changes to **E.V.A.** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.1] — 2026-03-27

### Added
- GPU-accelerated interaction engine (`requestAnimationFrame` loop)
- 3D Tilt effect on module cards and KPI panels
- Magnetic CTA button with proximity detection
- Zenith Particle system with mouse-aware attractor physics
- Parallax background layers (Cyber-Grid + Zenith Bloom)
- Staggered reveal animations with cubic-spring easing
- Page-in blur transition for cinematic entrance
- Project metadata strip in app header (Project ID, Terminal Node)
- Bento module grid on landing page (IPC, Biometry, Legal Audit)
- Smart-batch detection for 4-column IPC inputs (40/60/70/100%)
- High-precision currency parser with mixed-format tolerance

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
