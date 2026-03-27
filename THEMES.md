# 🎨 Sistema de Temas E.V.A.

Tu proyecto ahora tiene un **sistema dinámico de temas intercambiables** sin alterar la funcionalidad JavaScript.

## 📦 Estructura de Archivos

```
css/
├── base.css              # Estilos comunes (animaciones, bordes, tipografía)
└── themes/
    ├── dark.css          # 🌙 Tema Cibernético (Original Oscuro) - DEFAULT
    ├── light.css         # ☀️ Tema Profesional (Claro Corporativo)
    ├── forest.css        # 🌲 Tema Naturaleza (Verde Ecológico)
    └── minimal.css       # ⬜ Tema Minimalista (Limpio y Puro)

js/
└── theme-switcher.js     # Sistema de cambio de temas dinámico
```

## 🚀 Cómo Usar

### Opción 1: Selector Visual en la UI
- Los botones de tema aparecen automáticamente en el header
- Haz clic en el botón del tema deseado (🌙 Dark | ☀️ Light | 🌲 Forest | ⬜ Minimal)
- La selección se guarda en `localStorage` y persiste entre sesiones

### Opción 2: Cambiar Tema por Defecto
Edita `js/theme-switcher.js` línea ~50:

```javascript
const savedTheme = localStorage.getItem('eva-theme') || 'dark'; // Cambiar 'dark' por otro tema
```

### Opción 3: Desde JavaScript en Consola
```javascript
setTheme('light');  // 'dark', 'light', 'forest', 'minimal'
```

## 🎭 Descripción de Temas

### 🌙 Dark (Cibernético)
- **Colores**: Azul cyan (#00F2FE), fondo muy oscuro
- **Uso**: Ideal para largas sesiones, entornos profesionales con poca luz
- **Características**: Grid animado, glow effects

### ☀️ Light (Profesional)  
- **Colores**: Azul corporativo (#0066CC), fondo blanco
- **Uso**: Reportes, documentos impresos, presentaciones ejecutivas
- **Características**: Sombras sutiles, sin animaciones pesadas

### 🌲 Forest (Naturaleza)
- **Colores**: Verde esmeralda (#2ECC71), fondo verde oscuro
- **Uso**: Contexto forestal, sostenibilidad, ambiental
- **Características**: Paleta terracota/verde, orgánica

### ⬜ Minimal (Limpio)
- **Colores**: Negro puro (#000000), fondo blanco
- **Uso**: Máxima legibilidad, accesibilidad, minimalismo
- **Características**: Sin backgrounds gradientes, bordes sólidos simples

## 🔧 Personalización

### Agregar un Nuevo Tema
1. Crea archivo `css/themes/mi-tema.css`
2. Define las variables CSS (copia desde `dark.css` como template)
3. Actualiza `js/theme-switcher.js` - agrega entrada en objeto `THEMES`:

```javascript
const THEMES = {
    dark: { name: '🌙 Dark', file: 'css/themes/dark.css' },
    light: { name: '☀️ Light', file: 'css/themes/light.css' },
    // ... otros temas
    mitema: { name: 'Mi Tema', file: 'css/themes/mi-tema.css' }  // ← Agregar aquí
};
```

### Cambiar Paleta de Colores
Edita directamente el archivo de tema en `css/themes/*.css`:

```css
:root {
    --primary: #NUEVO_COLOR;        /* Color principal */
    --primary-glow: rgba(...);      /* Glow effects */
    --secondary: #COLOR;            /* Color secundario */
    --text-main: #TEXTO;            /* Texto principal */
    /* ... etc */
}
```

## ⚠️ Notas Técnicas

- ✅ **NO se rompió la funcionalidad JavaScript** - Solo CSS cambia
- ✅ **Persistencia**: El tema seleccionado se guarda en `localStorage`
- ✅ **Compatibilidad**: Funciona en todos los navegadores modernos
- ✅ **Performance**: Cambio de tema instantáneo, sin recarga
- 📱 **Responsive**: Los temas se adaptan a móvil automáticamente

## 🐛 Troubleshooting

**Los botones de tema no aparecen:**
- Verifica que `js/theme-switcher.js` está siendo cargado
- Abre consola (F12) y busca errores

**El tema no cambia:**
- Clearar `localStorage`: `localStorage.clear()`
- Recarga la página

**Colores desatualizados:**
- Limpia caché del navegador (Ctrl+Shift+R)

---

**Creado**: 2026-03-27 | **Versión**: Sistema de Temas v1.0 | **Autor**: Análisis Automatizado
