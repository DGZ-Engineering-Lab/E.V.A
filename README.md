<p align="center">
  <img src="assets/logo.png" alt="E.V.A. Logo" width="80" style="border-radius: 16px;" />
</p>

<h1 align="center">E.V.A. — Experto en Valoración de Activos</h1>

<p align="center">
  <strong>Forensic-Grade Appraisal Engine for Colombian Land & Forest Assets</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.5.1-00F2FE.svg?style=flat-square&logo=appveyor" alt="Version" />
  <img src="https://img.shields.io/badge/Status-Production_Ready-059669.svg?style=flat-square&logo=checkmarx" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Engine-Z--Factor_v1.5226-FBBF24.svg?style=flat-square" alt="Z-Factor" />
</p>

<p align="center">
  <em>Built by <a href="https://github.com/DGZ-Engineering-Lab">DGZ Engineering Lab</a> · Medellin, Colombia</em>
</p>

---

## 📋 Overview

**E.V.A.** is a zero-dependency, serverless web application engineered for Colombian appraisal professionals (**peritos avaluadores**). It automates two mission-critical workflows:

| Module | Description |
|---|---|
| **IPC Indexation Engine** | Bulk-processes monetary values from historical appraisals (e.g., 2018) to present value using the official DANE Consumer Price Index accumulation factor (`Zenith Factor = 1.5226`). |
| **Forest Biometry Engine** | Calculates biological asset valuations for 70+ Colombian tree species using the IGAC/CAR volumetric matrix, cross-referencing trunk girth (DAP) and commercial height against categorized pricing tables. |

## 🏗️ Architecture

```
ACT-IPC/
├── index.html                  # Landing page — project overview & module showcase
├── app.html                    # Core processing console (dual-mode: IPC + Avalúo)
├── assets/
│   └── logo.png                # Brand identity
├── css/
│   ├── base.css                # Shared design tokens & component styles
│   └── themes/
│       ├── dark.css            # Obsidian Night (default)
│       ├── light.css           # Arctic Engineering
│       ├── zenith.css          # Zenith High-Contrast
│       ├── forest.css          # Nature Green
│       └── minimal.css         # Pure Minimal
├── js/
│   ├── avaluo_db.js            # Species database & volumetric pricing matrix
│   └── theme-switcher.js       # Persistent theme engine with Chart.js sync
├── data/
│   └── act_ipc_data.json       # Raw volumetric vector data
├── docs/
│   ├── AVALUO_2026.XLSX        # Source spreadsheet (algorithmic audit trail)
│   └── formulas_*.txt          # INDEX/MATCH formula traceability logs
├── ARCHITECTURE.md             # Technical architecture documentation
├── CHANGELOG.md                # Version history
├── CONTRIBUTING.md             # Contribution guidelines
├── SECURITY.md                 # Security policy
└── LICENSE                     # MIT License
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/DGZ-Engineering-Lab/E.V.A.git

# Open directly — no build step, no server, no dependencies
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

> **Zero-Server Architecture**: E.V.A. runs 100% client-side. No Node.js, no npm, no database. Open the HTML file and operate.

## 🔧 Usage

### IPC Indexation Mode
1. Navigate to `app.html` → Select **Calculator** icon (IPC mode)
2. Paste monetary values — supports single values or tab-separated rows:
   ```
   $ 668.800,00    $ 1.003.200,00    $ 1.170.400,00    $ 1.672.000,00
   ```
3. Click **EJECUTAR PROCESAMIENTO** → Indexed values appear instantly
4. **COPIAR MATRIZ** to export to Excel/Word

### Forest Appraisal Mode
1. Switch to **Trees** icon (Avalúo mode)
2. Paste species data (tab-separated): `Species | Girth(cm) | Height(m)`
3. Click **CALCULAR AVALÚO GLOBAL** → Dual output: detail matrix + IPC projection

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| **Core** | Vanilla JS (ES6+), HTML5 Semantic, CSS3 Custom Properties |
| **Typography** | Hanken Grotesk (UI) + Space Mono (Data/Technical) |
| **Icons** | Lucide Icons (tree-shakeable SVG) |
| **Charts** | Chart.js (IPC historical tracking) |
| **Themes** | 5 persistent themes with CSS custom properties |
| **Performance** | GPU-accelerated animations, `requestAnimationFrame` loop, `will-change` hints |

## 📊 The Zenith Factor

The **Z-Factor (`1.5226`)** is the compound inflation accumulator:

```
Z = Π(1 + IPC_year) for years 2018→2025
Z = 1.038 × 1.0357 × 1.053 × 1.0551 × 1.1318 × 1.0928 × 1.0545
Z = 1.5226
```

Source: [DANE — Índice de Precios al Consumidor](https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc)

## 🎨 Themes

| Theme | Description | Use Case |
|---|---|---|
| **Obsidian Night** | Deep black with cyan accents | Extended sessions, low-light environments |
| **Arctic Engineering** | High-contrast light mode | Print-ready reports, daylight use |
| **Zenith High-Contrast** | Black + amber accents | Presentation mode, accessibility |
| **Forest Nature** | Deep green palette | Forestry-focused sessions |
| **Pure Minimal** | Monochrome B&W | Document-grade output |

## 📜 Legal Framework

E.V.A. is built to comply with Colombian regulatory standards:
- **IGAC** — Instituto Geográfico Agustín Codazzi (cadastral valuation)
- **DANE** — Departamento Administrativo Nacional de Estadística (IPC data)
- **Código General del Proceso** — Judicial appraisal requirements
- **Resolución 620/2008** — IGAC valuation methodology

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  <strong>DGZ Engineering Lab</strong> © 2026<br/>
  <em>Automating the Future of Cadastral & Environmental Appraisal</em> 🌍
</p>
