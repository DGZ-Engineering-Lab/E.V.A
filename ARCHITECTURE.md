# Documento de Arquitectura GIS & Financiera (`ARCHITECTURE.md`)

## 🌍 Arquitectura de E.V.A. (Experto en Valoración de Activos)

Este documento esboza las directrices topológicas de cálculo establecidas por DGZ Engineering Lab.

### 1. Topología de Tasación (Avalúo Forestal)
El motor opera como una *Lookup Table Bidimensional* estructurada. En Excel, esta lógica pertenece a operaciones hiper-complejas con `INDEX` y `MATCH`. 

Nuestra arquitectura lo simplificó migrando toda la **Matriz Matemática y Botánica** al archivo `avaluo_db.js`.
- **Eje X (Abarcadura)**: Evaluado sobre rangos límite de Diámetro Altura Pecho expresados en porcentaje (`cm / 100`).
- **Eje Y (Altura)**: Evaluado sobre alturas comerciales metros lineales de fuste aprovechable.
- **Base Categórica**: Subdivisión dinámica donde especies convergen en "Primera, Segunda o Tercera" basándose en el rigor del manual histórico de tasación IGAC/Corporaciones Autónomas Regionales.

### 2. Capa de Corrección Inflacionaria (IPC)
La inflación en Colombia obliga a que una matriz originada (ej. en 2018) deba ser llevada al Presente (2025/2026).
- **El Factor Zenith (`1.5226`)**: Es el algoritmo central producto directo de capitalización compuesta `1 + IPC`. En lugar de forzar llamadas a API en tiempo real que podrían no estar disponibles en el campus / terreno de la obra, el código pre-procesa el factor. 
- **Flujo de Proyección**: El sistema lee `$ Valor Crudo -> Factoriza -> Extrae Diferencia (Delta) -> Representa HTML`.

### 3. Infraestructura Glassmorphism de la UI
La UI carece de *Frameworks Clunky*. Todo corre en una capa nativa CSS con variables maestras HLS. Rejillas cartográficas pseudo-generadas vía gradientes de bajo impacto algorítmico, previniendo bajadas de FPS al procesar matrices de +1,000 mil árboles.
