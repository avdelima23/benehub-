# BeneHub — Portal Centralizado de Experiencia y Accesibilidad en Beneficios Corporativos

BeneHub es un proyecto académico que consiste en una aplicación web **estática**
(sin frameworks ni proceso de build) que centraliza los beneficios corporativos
de una empresa en un solo lugar, permitiendo a los colaboradores explorarlos,
buscarlos por necesidad y contactar al facilitador interno correspondiente.

## Objetivo

Facilitar el acceso y la comprensión de los beneficios corporativos (Salud,
Bienestar, Finanzas y Tiempo Libre) mediante un portal simple, accesible y
con búsqueda inteligente que interpreta necesidades del empleado (por
ejemplo, buscar "necesito un odontólogo" encuentra el plan odontológico).

## Características

- **Autenticación** con correo y contraseña mediante Supabase Auth (inicio
  de sesión, creación de cuenta y cierre de sesión). Solo los usuarios
  autenticados pueden ver el portal.
- **Catálogo de beneficios** organizado en tarjetas por categoría (Salud,
  Bienestar, Finanzas, Tiempo Libre), cada una con un color distintivo, y
  filtros para navegar por categoría.
- **Vista de detalle en modal**: descripción de cobertura, botón de
  redirección al sitio del proveedor externo, y datos de contacto del
  facilitador interno (nombre, correo y teléfono).
- **Búsqueda inteligente en tiempo real** que normaliza acentos y
  mayúsculas, y busca por nombre, descripción, categoría y palabras clave
  asociadas a cada beneficio.
- **Modo demo**: si no hay una conexión válida a Supabase configurada, la
  aplicación funciona con 12 beneficios de ejemplo embebidos (3 por
  categoría) y muestra un aviso visible al usuario.

## Estructura del proyecto

```
benehub-/
├── index.html            # Estructura de la aplicación (login, portal, modal)
├── css/
│   └── styles.css        # Estilos (diseño corporativo y responsive)
├── js/
│   ├── config.js         # Constantes SUPABASE_URL y SUPABASE_ANON_KEY
│   └── app.js             # Lógica: auth, datos, búsqueda, render, modal
├── supabase/
│   └── schema.sql         # Tabla `beneficios`, RLS y datos de ejemplo
└── README.md
```

## Stack tecnológico

- HTML5, CSS3 y JavaScript puro (ES6+), sin frameworks ni dependencias de npm.
- [Supabase](https://supabase.com/) (Auth + Postgres) como backend, cargado
  vía CDN con `@supabase/supabase-js` v2.
- Despliegue estático en [Netlify](https://www.netlify.com/), sin proceso
  de build (publish directory = raíz del proyecto).

## Configuración de Supabase

1. Crea un proyecto en [app.supabase.com](https://app.supabase.com/).
2. Ve a **SQL Editor** y ejecuta el contenido completo de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea la tabla
   `beneficios`, habilita Row Level Security (RLS) con una política de
   lectura para usuarios autenticados, e inserta los 12 beneficios de
   ejemplo.
3. Ve a **Authentication → Providers** y confirma que el proveedor de
   correo/contraseña (Email) esté habilitado.
4. Ve a **Settings → API** y copia:
   - `Project URL` → pégalo en `SUPABASE_URL`
   - `anon public key` → pégalo en `SUPABASE_ANON_KEY`
5. Abre `js/config.js` y reemplaza los valores de ejemplo:

   ```js
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_ANON_KEY = 'tu-clave-anonima-publica-aqui';
   ```

Mientras `js/config.js` conserve los valores placeholder, BeneHub arrancará
automáticamente en **modo demo**, mostrando el aviso correspondiente y los
12 beneficios embebidos sin necesidad de backend.

## Despliegue en Netlify

Este proyecto no requiere proceso de build (es HTML/CSS/JS puro):

1. Sube el repositorio a GitHub.
2. En Netlify, crea un nuevo sitio con **"Import an existing project"** y
   conecta el repositorio de GitHub.
3. Configuración de build:
   - **Build command:** dejar vacío (no aplica)
   - **Publish directory:** `.` (raíz del proyecto)
4. Despliega. Netlify servirá `index.html` directamente.
5. Si vas a usar Supabase en producción, recuerda actualizar
   `js/config.js` con tus credenciales reales antes de desplegar (o
   gestionarlo como parte de tu flujo de release).

## Ejecución local

Al ser una aplicación estática, basta con servir la carpeta con cualquier
servidor HTTP simple, por ejemplo:

```bash
npx serve .
# o bien
python3 -m http.server 8080
```

Luego abre `http://localhost:8080` (o el puerto indicado) en tu navegador.

## Notas de seguridad

- La `anon key` de Supabase es pública por diseño y está pensada para
  usarse en el cliente; el control de acceso real se hace mediante las
  políticas de Row Level Security definidas en `supabase/schema.sql`.
- La tabla `beneficios` solo permite lectura (`SELECT`) a usuarios
  autenticados; no expone políticas de escritura desde el cliente.
