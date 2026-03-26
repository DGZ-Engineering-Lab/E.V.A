# Seguridad Corporativa (`SECURITY.md`)

## Políticas de Seguridad - Proyecto E.V.A.

En DGZ Engineering Lab, tomamos muy en serio la seguridad financiera, algorítmica y la integridad de la base de datos de especies. Nuestro modelo de Avalúo Forestal indexa bases oficiales sin exposición server-side.

### 1. Plataforma Serverless y End-to-End Local
E.V.A. ha sido diseñada para no requerir conexión a bases de datos en la nube. Todo cálculo masivo se efectúa mediante *Client-Side processing* en la RAM del navegador pericial, previniendo fuga de datos de avalúos confidenciales. No transmitimos datos geolocalizados de las tasaciones a ningún servidor.

### 2. Reporte de Vulnerabilidades
Si como ingeniero o auditor descubres un fallo de lógica en el **Parser de Precios (Base Primera, Segunda o Tercera)** o en la indexación del **Factor IPC (1.5226)**, por favor no inicies un Issue público.
- **Protocolo de Contacto**: Envía un correo directo a nuestro Chief Engineering Officer (CEO / CTO) de DGZ.
- **Tiempo de Respuesta SLA**: 24-48 horas.

### 3. Entorno Aislado
Recomendamos a todos los peritos no utilizar plugins web externos que puedan interceptar la lectura del Portapapeles (`Clipboard API`) al exportar tablas. La función de "Copiado Crítico" incorporada en la App aísla el DOM para prevenir inyección XSS.
