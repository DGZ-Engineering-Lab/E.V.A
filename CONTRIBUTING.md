# Contributing to E.V.A.

Thank you for your interest in contributing to **E.V.A. — Experto en Valoración de Activos**.

## 🏗️ Project Structure

Before contributing, familiarize yourself with the [Architecture](ARCHITECTURE.md) document.

## 🔧 Development Setup

```bash
git clone https://github.com/DGZ-Engineering-Lab/E.V.A.git
cd E.V.A
# Open index.html in your browser — no build tools required
```

## 📏 Code Standards

### HTML
- Use semantic HTML5 elements
- All interactive elements must have unique `id` attributes
- Maintain `lang="es"` on all pages

### CSS
- Use CSS custom properties (defined in `css/themes/*.css`)
- Follow the existing naming convention: `--bg-*`, `--text-*`, `--primary-*`
- All new components must respect theme variables — never hardcode colors
- Performance: use `will-change` sparingly, prefer `transform` over `top/left`

### JavaScript
- Vanilla ES6+ only — no frameworks, no transpilers
- All monetary calculations must use `Intl.NumberFormat('es-CO')`
- Parser functions must handle Colombian currency format: `$ 1.234.567,89`

## 🎨 Adding a New Theme

1. Create `css/themes/your-theme.css`
2. Define all CSS custom properties (see `dark.css` as reference)
3. Add a theme node in the sidebar's `.theme-selector` in `app.html`
4. All 12 variables must be defined — partial themes will break the UI

## 🌳 Adding Species to the Database

Edit `js/avaluo_db.js` following the existing structure:
```javascript
{ nombre: "Especie", categoria: 1, precios: { ... } }
```
Ensure pricing data is sourced from official IGAC/CAR documentation.

## 📝 Commit Convention

```
feat: add new species to database
fix: correct IPC parser for negative values
style: refine glassmorphism on KPI cards
docs: update architecture diagram
perf: optimize rAF loop for particle engine
```

## 📋 Pull Request Process

1. Fork the repository
2. Create a feature branch: `feat/your-feature`
3. Ensure all themes render correctly with your changes
4. Submit a PR with a clear description of changes

---

**DGZ Engineering Lab** © 2026
