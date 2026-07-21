-- ============================================================================
-- BeneHub — Esquema de base de datos para Supabase (PostgreSQL)
-- ----------------------------------------------------------------------------
-- Instrucciones:
--   1. Entra al panel de tu proyecto en https://app.supabase.com/
--   2. Ve a "SQL Editor" → "New query"
--   3. Pega el contenido completo de este archivo y ejecútalo (Run)
--   4. Copia la URL y la anon key del proyecto en js/config.js
--
-- Este archivo es seguro de volver a ejecutar completo las veces que
-- necesites: las tablas, columnas y políticas usan "if not exists" / "drop
-- policy if exists", y los 12 beneficios de ejemplo solo se insertan si la
-- tabla `beneficios` está vacía (no se duplican en ejecuciones posteriores).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Tabla de beneficios
-- ----------------------------------------------------------------------------
create table if not exists public.beneficios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null check (categoria in ('Salud', 'Bienestar', 'Finanzas', 'Tiempo Libre')),
  descripcion text not null,
  cobertura text not null,
  proveedor_nombre text not null,
  proveedor_url text not null,
  facilitador_nombre text not null,
  facilitador_email text not null,
  facilitador_telefono text not null,
  palabras_clave text[] not null default '{}',
  condiciones_elegibles text[] not null default '{}',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

comment on table public.beneficios is 'Catálogo de beneficios corporativos disponibles en BeneHub.';
comment on column public.beneficios.condiciones_elegibles is 'Condiciones de cargo con acceso a este beneficio (Pasante/Temporal/Fijo). Arreglo vacío = visible para todas las condiciones.';
comment on column public.beneficios.activo is 'Si es false, el beneficio no se muestra en el portal pero se conserva en el panel admin.';

-- Red de seguridad para instalaciones que ya tenían la tabla `beneficios`
-- creada antes de que existieran estas columnas.
alter table public.beneficios add column if not exists condiciones_elegibles text[] not null default '{}';
alter table public.beneficios add column if not exists activo boolean not null default true;

-- ----------------------------------------------------------------------------
-- 2. Tabla de perfiles (nombre, condición del cargo y rol de cada usuario)
-- ----------------------------------------------------------------------------
-- Se crea automáticamente la primera vez que cada persona inicia sesión
-- (pantalla "Completa tu perfil" en la app). El rol siempre nace en
-- 'empleado': ascender a alguien a 'administrador' se hace manualmente
-- desde Table Editor en Supabase, nunca desde el cliente.
create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  correo text not null,
  condicion text not null check (condicion in ('Pasante', 'Temporal', 'Fijo')),
  rol text not null default 'empleado' check (rol in ('empleado', 'administrador')),
  creado_en timestamptz not null default now()
);

comment on table public.perfiles is 'Nombre, condición de cargo y rol de cada usuario de BeneHub.';

alter table public.perfiles enable row level security;

drop policy if exists "Un usuario puede ver su propio perfil" on public.perfiles;

create policy "Un usuario puede ver su propio perfil"
  on public.perfiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Un usuario puede crear su propio perfil como empleado" on public.perfiles;

-- El "with check" obliga a que el rol nazca como 'empleado': nadie puede
-- auto-asignarse 'administrador' insertando su propio perfil desde la app.
create policy "Un usuario puede crear su propio perfil como empleado"
  on public.perfiles
  for insert
  to authenticated
  with check (id = auth.uid() and rol = 'empleado');

-- No hay política de UPDATE: una vez creado, el perfil (incluido el rol) solo
-- se modifica manualmente desde Supabase por quien administra el proyecto.

-- ----------------------------------------------------------------------------
-- 3. Tabla de favoritos ("Mis Canjes")
-- ----------------------------------------------------------------------------
create table if not exists public.favoritos (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  beneficio_id uuid not null references public.beneficios(id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (usuario_id, beneficio_id)
);

comment on table public.favoritos is 'Beneficios que cada usuario guardó como favoritos.';

alter table public.favoritos enable row level security;

drop policy if exists "Un usuario gestiona sus propios favoritos" on public.favoritos;

create policy "Un usuario gestiona sus propios favoritos"
  on public.favoritos
  for all
  to authenticated
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. Row Level Security de `beneficios`
-- ----------------------------------------------------------------------------
-- Lectura: cualquier usuario autenticado ve todos los beneficios (activos e
-- inactivos); el portal filtra los inactivos y los no elegibles para su
-- condición en el cliente, mientras que el panel admin necesita verlos todos.
alter table public.beneficios enable row level security;

drop policy if exists "Lectura de beneficios para usuarios autenticados" on public.beneficios;

create policy "Lectura de beneficios para usuarios autenticados"
  on public.beneficios
  for select
  to authenticated
  using (true);

-- Escritura: solo quienes tengan rol 'administrador' en su perfil.
drop policy if exists "Escritura de beneficios solo para administradores" on public.beneficios;
drop policy if exists "Escritura de beneficios solo para administradores (perfiles)" on public.beneficios;

create policy "Escritura de beneficios solo para administradores (perfiles)"
  on public.beneficios
  for all
  to authenticated
  using (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'administrador'))
  with check (exists (select 1 from public.perfiles p where p.id = auth.uid() and p.rol = 'administrador'));

-- ----------------------------------------------------------------------------
-- 5. Migración desde la tabla `admins` (versión anterior del control de acceso)
-- ----------------------------------------------------------------------------
-- Si tu proyecto todavía tiene la tabla `admins` de una versión previa de
-- BeneHub, este bloque asciende automáticamente a 'administrador' (en
-- `perfiles`) a cualquier usuario que ya se haya registrado con un correo
-- presente en `admins`, y luego elimina esa tabla porque ya no se usa.
do $$
begin
  if to_regclass('public.admins') is not null then
    insert into public.perfiles (id, nombre, correo, condicion, rol)
    select
      u.id,
      coalesce(nullif(split_part(u.email, '@', 1), ''), 'Administrador'),
      u.email,
      'Fijo',
      'administrador'
    from auth.users u
    join public.admins a on lower(a.email) = lower(u.email)
    on conflict (id) do update set rol = 'administrador';

    drop table public.admins;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 6. Datos de ejemplo (12 beneficios, 3 por categoría)
-- ----------------------------------------------------------------------------
-- Solo se insertan si la tabla está vacía, para que puedas volver a correr
-- este archivo completo sin duplicar beneficios.
do $$
begin
  if not exists (select 1 from public.beneficios) then
    insert into public.beneficios
      (nombre, categoria, descripcion, cobertura, proveedor_nombre, proveedor_url, facilitador_nombre, facilitador_email, facilitador_telefono, palabras_clave, condiciones_elegibles, activo)
    values
      -- Salud
      ('Plan Odontológico Integral', 'Salud',
       'Cobertura completa de salud oral para el colaborador y su núcleo familiar directo.',
       'Incluye limpiezas semestrales, radiografías, resinas, extracciones simples y un 50% de descuento en ortodoncia.',
       'OdontoPlus S.A.', 'https://www.example.com/odontoplus',
       'Camila Rojas', 'camila.rojas@empresa.com', '+57 300 123 4567',
       array['odontólogo', 'dientes', 'dental', 'muela', 'ortodoncia', 'limpieza dental'],
       array['Fijo', 'Temporal'], true),

      ('Seguro Médico Complementario', 'Salud',
       'Seguro privado que complementa la EPS con acceso a clínicas y especialistas de alta calidad.',
       'Consultas médicas generales y especializadas, exámenes de laboratorio, hospitalización y urgencias 24/7.',
       'Colsalud Seguros', 'https://www.example.com/colsalud',
       'Andrés Muñoz', 'andres.munoz@empresa.com', '+57 300 234 5678',
       array['médico', 'clínica', 'especialista', 'urgencias', 'hospital', 'eps'],
       array['Fijo'], true),

      ('Programa de Salud Visual', 'Salud',
       'Beneficio anual para el cuidado de la visión de los colaboradores.',
       'Examen visual gratuito una vez al año y bono de descuento del 40% en monturas y lentes de contacto.',
       'VisiónClara Óptica', 'https://www.example.com/visionclara',
       'Camila Rojas', 'camila.rojas@empresa.com', '+57 300 123 4567',
       array['ojos', 'lentes', 'gafas', 'oftalmólogo', 'optometría', 'visión'],
       array[]::text[], true),

      -- Bienestar
      ('Membresía de Gimnasio Corporativa', 'Bienestar',
       'Acceso preferencial a la red de gimnasios aliados a nivel nacional.',
       'Descuento del 60% en la membresía mensual, clases grupales incluidas y acceso a más de 200 sedes.',
       'FitRed Nacional', 'https://www.example.com/fitred',
       'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
       array['gimnasio', 'ejercicio', 'deporte', 'entrenamiento', 'fitness', 'pesas'],
       array[]::text[], true),

      ('Acompañamiento Psicológico', 'Bienestar',
       'Sesiones confidenciales de apoyo emocional y salud mental para el colaborador y su familia.',
       'Hasta 6 sesiones anuales gratuitas con psicólogos certificados, presenciales o virtuales.',
       'MenteSana Psicología', 'https://www.example.com/mentesana',
       'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
       array['psicólogo', 'salud mental', 'terapia', 'estrés', 'ansiedad', 'emocional'],
       array[]::text[], true),

      ('Programa de Nutrición Personalizada', 'Bienestar',
       'Asesoría nutricional individual para mejorar hábitos alimenticios.',
       'Consulta inicial gratuita con nutricionista y plan alimenticio personalizado trimestral.',
       'NutriVida', 'https://www.example.com/nutrivida',
       'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
       array['nutrición', 'dieta', 'alimentación', 'nutricionista', 'peso'],
       array['Fijo', 'Temporal'], true),

      -- Finanzas
      ('Fondo de Ahorro Voluntario', 'Finanzas',
       'Programa de ahorro programado con aporte adicional de la empresa.',
       'La empresa aporta el 25% adicional sobre el ahorro mensual del colaborador, hasta un tope definido.',
       'Fiduciaria Crece', 'https://www.example.com/fiducrece',
       'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
       array['ahorro', 'fondo', 'dinero', 'inversión', 'finanzas personales'],
       array['Fijo'], true),

      ('Asesoría Financiera Gratuita', 'Finanzas',
       'Orientación personalizada para la planeación financiera y tributaria.',
       'Dos sesiones anuales gratuitas con asesores certificados sobre presupuesto, crédito e impuestos.',
       'Consultora Patrimonio', 'https://www.example.com/patrimonio',
       'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
       array['asesoría', 'impuestos', 'presupuesto', 'crédito', 'planeación financiera'],
       array[]::text[], true),

      ('Crédito de Libre Inversión Preferencial', 'Finanzas',
       'Línea de crédito con tasas preferenciales exclusivas para colaboradores.',
       'Tasa de interés reducida y desembolso prioritario en menos de 5 días hábiles.',
       'Banco Aliado', 'https://www.example.com/bancoaliado',
       'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
       array['crédito', 'préstamo', 'banco', 'tasa de interés', 'financiamiento'],
       array['Fijo'], true),

      -- Tiempo Libre
      ('Club de Beneficios en Entretenimiento', 'Tiempo Libre',
       'Descuentos exclusivos en cine, streaming y eventos culturales.',
       'Hasta 40% de descuento en boletería de cine y 2 meses gratis en plataformas de streaming aliadas.',
       'ClubOcio', 'https://www.example.com/clubocio',
       'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
       array['cine', 'streaming', 'entretenimiento', 'ocio', 'eventos', 'cultura'],
       array[]::text[], true),

      ('Programa de Viajes y Turismo', 'Tiempo Libre',
       'Tarifas corporativas especiales para planes de viaje y vacaciones.',
       'Descuentos de hasta el 30% en paquetes turísticos nacionales e internacionales seleccionados.',
       'ViajaMás Agencia', 'https://www.example.com/viajamas',
       'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
       array['viajes', 'turismo', 'vacaciones', 'hotel', 'tiquetes'],
       array['Fijo', 'Temporal'], true),

      ('Días de Voluntariado Corporativo', 'Tiempo Libre',
       'Tiempo remunerado destinado a actividades de voluntariado y responsabilidad social.',
       'Hasta 2 días al año con goce de sueldo para participar en actividades de voluntariado avaladas.',
       'Fundación ManosUnidas', 'https://www.example.com/manosunidas',
       'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
       array['voluntariado', 'fundación', 'responsabilidad social', 'comunidad'],
       array[]::text[], true);
  end if;
end $$;
