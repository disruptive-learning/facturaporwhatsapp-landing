# Factura por WhatsApp — Landing Page

Sitio de marketing para un servicio de emisión de CFDI 4.0 mediante conversaciones de WhatsApp con un agente de inteligencia artificial.

## Tecnologías

- **TypeScript** (strict mode, ES2022 target)
- **Vite** via `rolldown-vite` (bundler Rust-based más rápido)
- **Tailwind CSS 4.x** (integrado directamente como plugin de Vite, sin PostCSS)
- **Bun** como gestor de paquetes y runtime

## Instalación

```bash
bun install
```

## Scripts

| Comando | Descripción |
|---|---|
| `bun run dev` | Servidor de desarrollo con hot reload |
| `bun run build` | Type check + build de producción |
| `bun run preview` | Preview del build de producción |

## Estructura de archivos

```
.
├── index.html          # Página principal (hero, pricing, features, CTA modal)
├── authorize.html      # Callback OAuth para integración Meta WhatsApp Business
├── privacidad.html     # Política de privacidad
├── terminos.html       # Términos y condiciones
├── src/
│   ├── main.ts         # Lógica del modal, validación de teléfono y envío de forma
│   └── style.css       # Estilos Tailwind + tema neo-brutalista personalizado
├── public/
│   └── facturaporwhatsapp.png
├── vite.config.ts      # MPA: 4 entradas HTML separadas
└── tsconfig.json
```

## Integración con el backend

La página de captura de leads envía un `POST` a `/outreach/prospect` en el backend. El endpoint se resuelve dinámicamente en runtime según el hostname, sin variables de entorno en tiempo de build:

- **Localhost / staging:** `https://staging.<dominio>/outreach/prospect`
- **Producción:** `https://app.<dominio>/outreach/prospect`

### Payload enviado

```json
{
  "fullName": "string",
  "phoneNumber": "+521234567890",
  "source": "landing-page",
  "locale": "es-MX",
  "userAgent": "string",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "utm": {
    "source": null,
    "medium": null,
    "campaign": null,
    "content": null,
    "term": null
  },
  "device": { "width": 1440, "height": 900 },
  "engagement": { "timeToSubmit": 12.4 }
}
```

### OAuth — authorize.html

Procesa callbacks de autorización de Meta WhatsApp Business. Parsea los parámetros `code`, `state`, `error` y `error_description` de la URL y muestra el estado al usuario.

## Características del formulario

- **Validación E.164** en tiempo real con autocompletado del código de país México (`+52`)
- **Honeypot anti-spam** (campo `company` oculto; envío silenciado si viene relleno)
- **UTM tracking**: captura y reenvía `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- **Engagement metrics**: tiempo desde apertura del modal hasta envío
- Cierre automático del modal 3 segundos después del éxito

## Diseño

Estética **neo-brutalista**:
- Bordes negros sólidos (3–6px), sin border-radius en botones/inputs
- Sombras con offset en lugar de blur (`brutal-shadow`, `brutal-shadow-lg`)
- Paleta: coral `#EF713D`, charcoal `#222831`, tech-grey `#C3CFD9`
- Animaciones: flotación del mockup de teléfono, mensajes de chat con entrada escalonada
