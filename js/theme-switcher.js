/**
 * E.V.A PRO Theme Switcher Engine
 * DGZ Engineering Lab // 2026
 */

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('eva-theme') || 'dark';
    setTheme(savedTheme);
});

function setTheme(theme) {
    const themeLink = document.getElementById('theme-styles');
    if (themeLink) {
        themeLink.href = `css/themes/${theme}.css?v=2026.3`;
        localStorage.setItem('eva-theme', theme);
        
        // Add a class to body for specific CSS tweaks if needed
        document.body.className = `eva-theme-${theme}`;
        
        // Update any UI elements that need theme-specific updates (e.g., Chart.js colors)
        updateChartTheme(theme);
    }
}

function updateChartTheme(theme) {
    if (typeof Chart === 'undefined') return;
    const charts = Chart.instances;
    Object.values(charts).forEach(chart => {
        const isDark = theme === 'dark' || theme === 'zenith';
        const color = isDark ? '#64748B' : '#475569';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        
        if (chart.options.scales) {
            if (chart.options.scales.x) {
                if (chart.options.scales.x.grid) chart.options.scales.x.grid.color = gridColor;
                if (chart.options.scales.x.ticks) chart.options.scales.x.ticks.color = color;
            }
            if (chart.options.scales.y) {
                if (chart.options.scales.y.grid) chart.options.scales.y.grid.color = gridColor;
                if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = color;
            }
        }
        chart.update();
    });
}
