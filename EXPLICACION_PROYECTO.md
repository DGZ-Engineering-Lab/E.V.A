# 🌳 E.V.A. — Guía Maestra del Proyecto
### Experto en Valoración de Activos (Biological & Monetary Forensics)

Esta guía ha sido diseñada para que comprendas a profundidad cómo funciona E.V.A., permitiéndote explicarlo con autoridad técnica y profesionalismo.

---

## 1. 🎯 ¿Qué es E.V.A.?
**E.V.A.** es una suite forense digital diseñada para el peritaje de activos biológicos (árboles) e indexación monetaria (IPC) en Colombia. 

Su propuesta de valor es la **Independencia Total**: No requiere servidores, bases de datos externas ni conexión a internet para funcionar. Es un "motor estático" de alto rendimiento que un perito puede llevar en una memoria USB y ejecutar en cualquier navegador.

---

## 2. 🏗️ Arquitectura de Archivos (Mapa del Tesoro)

El proyecto está organizado de manera modular para separar la **Lógica**, los **Datos** y la **Presentación**:

### 📄 Interfaz (Presentación)
- **`index.html`**: El "Showroom". Explica las capacidades del sistema y sirve como punto de entrada profesional.
- **`app.html`**: El "Centro de Mando". Aquí es donde ocurre la magia. Contiene la interfaz de usuario (UI) responsiva, el sistema de pestañas y el HUD (Heads-Up Display) de resultados.

### 🧠 Cerebro y Lógica (JS)
- **`js/eva-core-v3.js`**: Es el motor principal. Gestiona:
    - El parseo de datos (limpieza de texto pegado desde Excel).
    - El cálculo del **Factor Zenith** (IPC acumulado).
    - La lógica de exportación a **PDF, CSV y Excel**.
    - El renderizado de los gráficos de **Analytica Grid**.
- **`js/avaluo_db.js`**: El diccionario botánico-financiero. Contiene más de 70 especies y la matriz volumétrica oficial para el cálculo de valoración según DAP (diámetro) y altura.
- **`js/theme-switcher.js`**: Controla el ambiente visual (Oscuro, Claro, Bosque, Zenith) y sincroniza los colores de los gráficos para que siempre sean legibles.

### 🎨 Estilo y Identidad (CSS)
- **`css/eva-styles-v3.css`**: Define el lenguaje visual: *Glassmorphism* (efectos de cristal), bordes de gradiente y tipografías técnicas (`Space Mono` y `Hanken Grotesk`).

---

## 3. 📉 Lógica Forense: ¿Cómo calcula los valores?

### A. Indexación Monetaria (Modo IPC)
Utiliza el **Factor Zenith (1.5226)**. Este número representa la inflación acumulada en Colombia desde 2018 hasta 2025.
- **Fórmula**: `Valor_Original * 1.5226 = Valor_Actual_Indexado`.
- **Precisión**: Basado directamente en los datos históricos del DANE.

### B. Valoración Biométrica (Modo Árboles)
1. **Identificación**: Busca la especie en `avaluo_db.js`.
2. **Ubicación en Matriz**: Cruza la **Abarcadura** (circunferencia) y la **Altura** comercial.
3. **Cálculo Base**: Obtiene el valor al 40% (valor comercial base).
4. **Escalamiento**: Calcula automáticamente los valores al 60%, 70% y 100% (valor ecológico/total).
5. **Indexación**: Aplica el Factor Zenith al resultado final para traerlo a pesos de 2025.

---

## 4. 📊 Analytica Grid (Visualización de Datos)
En la pestaña de **Análisis**, E.V.A. procesa los datos en tiempo real mediante:
- **Bar Chart**: Compara visualmente la masa monetaria (lo que valía antes vs. lo que vale hoy).
- **Pie Chart**: Muestra qué especies representan la mayor parte del valor del predio.
- **KPI Cards**: Muestra métricas críticas como el "Valor Promedio por Árbol" y el "Registro Máximo" (el individuo más valioso).

---

## 5. 🛡️ Características de Grado Pericial
Para que un perito pueda presentar esto ante un juez o entidad, E.V.A. incluye:
1. **Reloj Sincronizado**: Forzado a la hora de Bogotá (`America/Bogota`) para marcas de tiempo legales.
2. **Exportación Robusta**:
    - **PDF**: Captura visual del reporte con alta definición.
    - **Excel/CSV**: Datos tabulares listos para anexar a un proceso judicial o informe técnico.
3. **Persistence**: Auto-guarda los datos en el navegador (Localstorage), para que si se cierra la pestaña por error, no se pierda el trabajo.

---

## 💡 Tips para explicar el proyecto:
- *"Es una herramienta **Engine-First**: todo el poder reside en el algoritmo, no en la conectividad."*
- *"Utiliza **Glassmorphism** para que la interfaz se sienta moderna y técnica, como una consola de GIS o ingeniería."*
- *"La base de datos es 100% local, garantizando la **privacidad total** de los datos del cliente."*

---
**DGZ Engineering Lab** © 2026 | *Precision Forensics Engine*
