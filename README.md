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
- **Panel de administración** (`admin.html`): permite crear, editar y
  eliminar beneficios desde la propia app. Solo lo pueden usar los correos
  registrados en la tabla `admins` de Supabase; el resto de usuarios
  autenticados no ve el enlace ni tiene permisos de escritura (reforzado
  por Row Level Security en la base de datos, no solo en el cliente).

## Estructura del proyecto

```
benehub-/
├── index.html            # Estructura de la aplicación (login, portal, modal)
├── admin.html             # Panel de administración de beneficios
├── css/
│   └── styles.css        # Estilos (diseño corporativo y responsive)
├── js/
│   ├── config.js         # Constantes SUPABASE_URL y SUPABASE_ANON_KEY
│   ├── app.js             # Lógica del portal: auth, datos, búsqueda, render, modal
│   └── admin.js           # Lógica del panel de administración (CRUD de beneficios)
├── supabase/
│   └── schema.sql         # Tablas `beneficios` y `admins`, RLS y datos de ejemplo
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

## Panel de administración

El panel de administración vive en `admin.html`, una página aparte que
**no está enlazada desde ningún menú del portal** — se accede escribiendo
la URL directamente, por ejemplo:

```
https://tu-sitio.netlify.app/admin.html
```

Permite gestionar el catálogo de beneficios sin tocar el SQL Editor de
Supabase directamente.

**Para darle acceso de administrador a alguien:**

1. Ve a **Table Editor → admins** en tu proyecto de Supabase (esta tabla la
   crea el propio `supabase/schema.sql`).
2. Inserta una fila con el correo con el que esa persona inicia sesión en
   BeneHub, por ejemplo `tu-correo@empresa.com`. La comparación **no
   distingue mayúsculas de minúsculas**, pero evita espacios al inicio o al
   final del correo.
3. Esa persona debe tener sesión iniciada en BeneHub (desde `index.html`) y
   luego entrar a `admin.html`.

**Desde el panel puede:**
- Ver todos los beneficios en una tabla.
- Crear uno nuevo con **"+ Agregar beneficio"**.
- Editar cualquier campo con el botón **"Editar"** (abre el mismo
  formulario con los datos precargados).
- Eliminarlo con **"Eliminar"** (pide confirmación).
- El campo de palabras clave se escribe separado por comas
  (ej. `odontólogo, dientes, dental`) y la app lo convierte automáticamente
  al arreglo que usa la búsqueda inteligente.

La protección real no depende de que la URL sea secreta: las políticas de
Row Level Security en `beneficios` solo permiten `INSERT`, `UPDATE` y
`DELETE` a los correos presentes en la tabla `admins` (ver sección 4 de
`supabase/schema.sql`). Un usuario sin permisos que intente llamar a la API
directamente recibirá un error de la base de datos.

**Si `admin.html` te dice que no tienes permisos:** el mensaje ahora indica
la causa exacta:
- *"ese correo no está en la tabla admins"* → agrégalo en Table Editor tal
  como inicias sesión (no importan mayúsculas/minúsculas).
- *"error técnico: ..."* → revisa que la tabla `admins` y sus políticas de
  RLS existan en tu proyecto (vuelve a correr la sección 4 de
  `supabase/schema.sql`).

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
- La tabla `beneficios` permite lectura (`SELECT`) a cualquier usuario
  autenticado, y escritura (`INSERT`/`UPDATE`/`DELETE`) únicamente a los
  correos presentes en la tabla `admins`.
- BeneHub no mantiene una lista propia de usuarios y contraseñas: las
  cuentas las crea cada persona desde el botón "Crear cuenta" y Supabase
  Auth guarda las contraseñas cifradas — no son recuperables en texto
  plano ni por el equipo del proyecto ni por Supabase.
