# BeneHub — Portal Centralizado de Experiencia y Accesibilidad en Beneficios Corporativos

BeneHub es un proyecto académico que consiste en una aplicación web **estática**
(sin frameworks ni proceso de build) que centraliza los beneficios corporativos
de una empresa en un solo lugar, permitiendo a los colaboradores explorarlos
según su condición de cargo, buscarlos por necesidad, guardarlos como
favoritos y contactar al facilitador interno correspondiente.

## Problema que resuelve

Los colaboradores de las organizaciones suelen desconocer la totalidad de los
beneficios disponibles o pierden tiempo buscando plataformas, pólizas y
contactos externos debido a la dispersión de la información. BeneHub
centraliza todo eso en un portal único, filtrado automáticamente según la
condición de cargo de cada persona (Pasante, Temporal o Fijo).

## Características

- **Autenticación** con correo y contraseña mediante Supabase Auth (inicio
  de sesión, creación de cuenta y cierre de sesión). Solo los usuarios
  autenticados pueden ver el portal.
- **Perfil de usuario**: la primera vez que alguien inicia sesión, se le pide
  su nombre y su condición de cargo (Pasante / Temporal / Fijo). A partir de
  ahí, el portal solo muestra los beneficios elegibles para esa condición.
- **Catálogo de beneficios** organizado en tarjetas por categoría (Salud,
  Bienestar, Finanzas, Tiempo Libre), cada una con un color distintivo, y
  filtros para navegar por categoría.
- **Favoritos ("Mis Canjes")**: cada tarjeta tiene un botón de estrella para
  guardar los beneficios de uso frecuente, y un filtro "⭐ Mis favoritos"
  para verlos todos juntos.
- **Vista de detalle en modal**: descripción de cobertura, botón de
  redirección al sitio del proveedor externo, y datos de contacto del
  facilitador interno (nombre, correo y teléfono).
- **Búsqueda inteligente en tiempo real** que normaliza acentos y
  mayúsculas, y busca por nombre, descripción, categoría y palabras clave
  asociadas a cada beneficio.
- **Modo demo**: si no hay una conexión válida a Supabase configurada, la
  aplicación funciona con 12 beneficios de ejemplo embebidos (3 por
  categoría) y muestra un aviso visible al usuario. El perfil y los
  favoritos también funcionan en modo demo, aunque solo en memoria (se
  pierden al recargar la página).
- **Panel de administración** (`admin.html`): permite crear, editar,
  activar/desactivar y eliminar beneficios desde la propia app. Es una
  página aparte, sin enlace visible en el portal; solo pueden operar en
  ella los usuarios cuyo perfil tenga rol `administrador` (ver más abajo).

## Estructura del proyecto

```
benehub-/
├── index.html            # Login, pantalla de perfil y portal (búsqueda, filtros, favoritos, modal)
├── admin.html             # Panel de administración de beneficios
├── css/
│   └── styles.css        # Estilos (diseño corporativo y responsive)
├── js/
│   ├── config.js         # Constantes SUPABASE_URL y SUPABASE_ANON_KEY
│   ├── app.js             # Lógica del portal: auth, perfil, datos, búsqueda, favoritos, modal
│   └── admin.js           # Lógica del panel de administración (CRUD de beneficios)
├── supabase/
│   └── schema.sql         # Tablas beneficios / perfiles / favoritos, RLS y datos de ejemplo
└── README.md
```

## Stack tecnológico

- HTML5, CSS3 y JavaScript puro (ES6+), sin frameworks ni dependencias de npm.
- [Supabase](https://supabase.com/) (Auth + Postgres) como backend, cargado
  vía CDN con `@supabase/supabase-js` v2.
- Despliegue estático en [Netlify](https://www.netlify.com/), sin proceso
  de build (publish directory = raíz del proyecto).

## Modelo de datos (Supabase)

- **`beneficios`**: nombre, categoría, descripción, cobertura, proveedor
  (nombre + URL), facilitador (nombre, correo, teléfono), palabras clave,
  `condiciones_elegibles` (qué condiciones de cargo lo pueden ver — vacío
  significa "todas") y `activo` (si se muestra en el portal).
- **`perfiles`**: nombre, correo, `condicion` (Pasante/Temporal/Fijo) y
  `rol` (`empleado` o `administrador`) de cada usuario. Se crea
  automáticamente la primera vez que alguien completa la pantalla
  "Completa tu perfil".
- **`favoritos`**: relación usuario–beneficio para la función de favoritos.

## Configuración de Supabase

1. Crea un proyecto en [app.supabase.com](https://app.supabase.com/).
2. Ve a **SQL Editor** y ejecuta el contenido completo de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea las tablas
   `beneficios`, `perfiles` y `favoritos`, habilita Row Level Security (RLS)
   en las tres, e inserta los 12 beneficios de ejemplo (solo si la tabla
   está vacía, así que puedes volver a correr este archivo sin duplicar
   nada).
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

> Nota para pruebas: no necesitas correos reales de tus compañeros para
> probar las distintas condiciones de cargo. Supabase Auth no verifica que
> seas dueño del correo salvo que actives "Confirm email" en
> Authentication → Sign In / Providers → Email. Puedes crear cuentas de
> prueba como `pasante1@test.com`, `temporal1@test.com`, `fijo1@test.com`,
> etc.

## Panel de administración

El panel de administración vive en `admin.html`, una página aparte que
**no está enlazada desde ningún menú del portal** — se accede escribiendo
la URL directamente, por ejemplo:

```
https://tu-sitio.netlify.app/admin.html
```

**Para darle acceso de administrador a alguien:**

1. Esa persona debe iniciar sesión al menos una vez en `index.html` y
   completar la pantalla "Completa tu perfil" (esto crea su fila en la
   tabla `perfiles`).
2. Ve a **Table Editor → perfiles** en tu proyecto de Supabase, busca su
   fila (por su correo) y cambia la columna `rol` de `empleado` a
   `administrador`.
3. Esa persona ya puede entrar a `admin.html` con su sesión iniciada.

Nadie puede auto-asignarse el rol de administrador desde la app: el rol
siempre nace como `empleado` al crear el perfil (reforzado por la política
de RLS de inserción), y solo se puede cambiar manualmente desde Supabase.

**Desde el panel puede:**
- Ver todos los beneficios en una tabla, con su condición elegible y estado.
- Crear uno nuevo con **"+ Agregar beneficio"**.
- Editar cualquier campo con **"Editar"** (abre el formulario con los datos
  precargados, incluyendo los checkboxes de condiciones elegibles).
- **Activar/Desactivar** un beneficio: los inactivos dejan de mostrarse en
  el portal pero se conservan en el panel (a diferencia de "Eliminar
  permanentemente", que sí borra el registro sin posibilidad de deshacerlo).
- El campo de palabras clave se escribe separado por comas
  (ej. `odontólogo, dientes, dental`) y la app lo convierte automáticamente
  al arreglo que usa la búsqueda inteligente.
- Las casillas de "Condiciones de cargo elegibles": si no marcas ninguna,
  el beneficio queda visible para todas las condiciones.

La protección real no depende de que la URL sea secreta: las políticas de
Row Level Security en `beneficios` solo permiten `INSERT`, `UPDATE` y
`DELETE` a usuarios cuyo perfil tenga `rol = 'administrador'` (sección 4 de
`supabase/schema.sql`). Un usuario sin permisos que intente llamar a la API
directamente recibirá un error de la base de datos.

**Si `admin.html` te dice que no tienes permisos:** el mensaje indica la
causa exacta — perfil inexistente (falta completarlo en `index.html`), rol
`empleado` (pide que te asciendan en Table Editor), o un error técnico de
RLS.

### Si vienes de una versión anterior de BeneHub

Versiones previas de este proyecto usaban una tabla `admins` (por correo) en
vez de `perfiles.rol`. Si tu proyecto de Supabase todavía tiene esa tabla,
`supabase/schema.sql` la detecta automáticamente, asciende a
`administrador` en `perfiles` a cualquier correo que ya estuviera en
`admins` y ya tenga una cuenta creada, y luego elimina la tabla `admins`
(ya no se usa). Solo tienes que volver a correr el archivo completo.

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
  autenticado, y escritura (`INSERT`/`UPDATE`/`DELETE`) únicamente a
  usuarios con `rol = 'administrador'` en `perfiles`.
- Cada usuario solo puede leer su propio perfil y gestionar sus propios
  favoritos (políticas de RLS con `auth.uid()`); nadie puede ver el perfil
  o los favoritos de otra persona desde el cliente.
- BeneHub no mantiene una lista propia de usuarios y contraseñas: las
  cuentas las crea cada persona desde el botón "Crear cuenta" y Supabase
  Auth guarda las contraseñas cifradas — no son recuperables en texto
  plano ni por el equipo del proyecto ni por Supabase.
