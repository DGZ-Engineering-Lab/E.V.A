# Security Policy — E.V.A. PRO

## Supported Versions

| Version | Supported |
|---|---|
| 2.5.x | ✅ Current |
| 2.0.x | ⚠️ Maintenance only |
| < 2.0 | ❌ End of life |

## Architecture Security Model

E.V.A. operates under a **Zero-Server, Zero-Network** architecture:

- **No backend** — all processing occurs client-side in the browser
- **No API calls** — no external data transmission
- **No database** — data lives only in the user's browser session
- **No cookies** — only `localStorage` for theme preference

### Data Handling

| Data | Storage | Persistence |
|---|---|---|
| Monetary values (IPC input) | Browser memory only | Lost on page close |
| Species data (Avalúo input) | Browser memory only | Lost on page close |
| Result tables | DOM only | Lost on page close |
| Theme preference | `localStorage` | Persistent (non-sensitive) |

### Third-Party Dependencies

| Dependency | Purpose | Risk |
|---|---|---|
| Google Fonts (Hanken Grotesk, Space Mono) | Typography | Low — CDN load only |
| Lucide Icons (unpkg CDN) | SVG icons | Low — CDN load only |
| Chart.js (jsDelivr CDN) | Data visualization | Low — CDN load only |

## Reporting a Vulnerability

If you discover a security issue, please report it via:
- **Email**: security@dgz-engineering-lab.com
- **GitHub Issues**: Use the `security` label

We will respond within 48 hours.

---

**DGZ Engineering Lab** © 2026
