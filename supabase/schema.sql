-- ============================================================================
-- BeneHub — Esquema de base de datos para Supabase (PostgreSQL)
-- ----------------------------------------------------------------------------
-- Instrucciones:
--   1. Entra al panel de tu proyecto en https://app.supabase.com/
--   2. Ve a "SQL Editor" → "New query"
--   3. Pega el contenido completo de este archivo y ejecútalo (Run)
--   4. Copia la URL y la anon key del proyecto en js/config.js
--   5. Para usar el panel de administración (admin.html), agrega tu correo
--      a la tabla `admins` (ver sección 4 más abajo)
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
  creado_en timestamptz not null default now()
);

comment on table public.beneficios is 'Catálogo de beneficios corporativos disponibles en BeneHub.';

-- ----------------------------------------------------------------------------
-- 2. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
-- Todos los usuarios autenticados pueden leer el catálogo de beneficios.
-- La escritura (crear/editar/eliminar) queda restringida a administradores
-- mediante la tabla `admins` y las políticas definidas en la sección 4.
alter table public.beneficios enable row level security;

drop policy if exists "Lectura de beneficios para usuarios autenticados" on public.beneficios;

create policy "Lectura de beneficios para usuarios autenticados"
  on public.beneficios
  for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3. Datos de ejemplo (12 beneficios, 3 por categoría)
-- ----------------------------------------------------------------------------
insert into public.beneficios
  (nombre, categoria, descripcion, cobertura, proveedor_nombre, proveedor_url, facilitador_nombre, facilitador_email, facilitador_telefono, palabras_clave)
values
  -- Salud
  ('Plan Odontológico Integral', 'Salud',
   'Cobertura completa de salud oral para el colaborador y su núcleo familiar directo.',
   'Incluye limpiezas semestrales, radiografías, resinas, extracciones simples y un 50% de descuento en ortodoncia.',
   'OdontoPlus S.A.', 'https://www.example.com/odontoplus',
   'Camila Rojas', 'camila.rojas@empresa.com', '+57 300 123 4567',
   array['odontólogo', 'dientes', 'dental', 'muela', 'ortodoncia', 'limpieza dental']),

  ('Seguro Médico Complementario', 'Salud',
   'Seguro privado que complementa la EPS con acceso a clínicas y especialistas de alta calidad.',
   'Consultas médicas generales y especializadas, exámenes de laboratorio, hospitalización y urgencias 24/7.',
   'Colsalud Seguros', 'https://www.example.com/colsalud',
   'Andrés Muñoz', 'andres.munoz@empresa.com', '+57 300 234 5678',
   array['médico', 'clínica', 'especialista', 'urgencias', 'hospital', 'eps']),

  ('Programa de Salud Visual', 'Salud',
   'Beneficio anual para el cuidado de la visión de los colaboradores.',
   'Examen visual gratuito una vez al año y bono de descuento del 40% en monturas y lentes de contacto.',
   'VisiónClara Óptica', 'https://www.example.com/visionclara',
   'Camila Rojas', 'camila.rojas@empresa.com', '+57 300 123 4567',
   array['ojos', 'lentes', 'gafas', 'oftalmólogo', 'optometría', 'visión']),

  -- Bienestar
  ('Membresía de Gimnasio Corporativa', 'Bienestar',
   'Acceso preferencial a la red de gimnasios aliados a nivel nacional.',
   'Descuento del 60% en la membresía mensual, clases grupales incluidas y acceso a más de 200 sedes.',
   'FitRed Nacional', 'https://www.example.com/fitred',
   'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
   array['gimnasio', 'ejercicio', 'deporte', 'entrenamiento', 'fitness', 'pesas']),

  ('Acompañamiento Psicológico', 'Bienestar',
   'Sesiones confidenciales de apoyo emocional y salud mental para el colaborador y su familia.',
   'Hasta 6 sesiones anuales gratuitas con psicólogos certificados, presenciales o virtuales.',
   'MenteSana Psicología', 'https://www.example.com/mentesana',
   'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
   array['psicólogo', 'salud mental', 'terapia', 'estrés', 'ansiedad', 'emocional']),

  ('Programa de Nutrición Personalizada', 'Bienestar',
   'Asesoría nutricional individual para mejorar hábitos alimenticios.',
   'Consulta inicial gratuita con nutricionista y plan alimenticio personalizado trimestral.',
   'NutriVida', 'https://www.example.com/nutrivida',
   'Laura Gómez', 'laura.gomez@empresa.com', '+57 300 345 6789',
   array['nutrición', 'dieta', 'alimentación', 'nutricionista', 'peso']),

  -- Finanzas
  ('Fondo de Ahorro Voluntario', 'Finanzas',
   'Programa de ahorro programado con aporte adicional de la empresa.',
   'La empresa aporta el 25% adicional sobre el ahorro mensual del colaborador, hasta un tope definido.',
   'Fiduciaria Crece', 'https://www.example.com/fiducrece',
   'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
   array['ahorro', 'fondo', 'dinero', 'inversión', 'finanzas personales']),

  ('Asesoría Financiera Gratuita', 'Finanzas',
   'Orientación personalizada para la planeación financiera y tributaria.',
   'Dos sesiones anuales gratuitas con asesores certificados sobre presupuesto, crédito e impuestos.',
   'Consultora Patrimonio', 'https://www.example.com/patrimonio',
   'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
   array['asesoría', 'impuestos', 'presupuesto', 'crédito', 'planeación financiera']),

  ('Crédito de Libre Inversión Preferencial', 'Finanzas',
   'Línea de crédito con tasas preferenciales exclusivas para colaboradores.',
   'Tasa de interés reducida y desembolso prioritario en menos de 5 días hábiles.',
   'Banco Aliado', 'https://www.example.com/bancoaliado',
   'Diego Fernández', 'diego.fernandez@empresa.com', '+57 300 456 7890',
   array['crédito', 'préstamo', 'banco', 'tasa de interés', 'financiamiento']),

  -- Tiempo Libre
  ('Club de Beneficios en Entretenimiento', 'Tiempo Libre',
   'Descuentos exclusivos en cine, streaming y eventos culturales.',
   'Hasta 40% de descuento en boletería de cine y 2 meses gratis en plataformas de streaming aliadas.',
   'ClubOcio', 'https://www.example.com/clubocio',
   'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
   array['cine', 'streaming', 'entretenimiento', 'ocio', 'eventos', 'cultura']),

  ('Programa de Viajes y Turismo', 'Tiempo Libre',
   'Tarifas corporativas especiales para planes de viaje y vacaciones.',
   'Descuentos de hasta el 30% en paquetes turísticos nacionales e internacionales seleccionados.',
   'ViajaMás Agencia', 'https://www.example.com/viajamas',
   'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
   array['viajes', 'turismo', 'vacaciones', 'hotel', 'tiquetes']),

  ('Días de Voluntariado Corporativo', 'Tiempo Libre',
   'Tiempo remunerado destinado a actividades de voluntariado y responsabilidad social.',
   'Hasta 2 días al año con goce de sueldo para participar en actividades de voluntariado avaladas.',
   'Fundación ManosUnidas', 'https://www.example.com/manosunidas',
   'Mariana Torres', 'mariana.torres@empresa.com', '+57 300 567 8901',
   array['voluntariado', 'fundación', 'responsabilidad social', 'comunidad']);

-- ----------------------------------------------------------------------------
-- 4. Administradores y permisos de escritura sobre beneficios
-- ----------------------------------------------------------------------------
-- Tabla de correos autorizados a gestionar el catálogo desde el panel de
-- administración de BeneHub (admin.html). Para dar acceso de administrador
-- a alguien, inserta su correo aquí (debe coincidir exactamente con el
-- correo con el que esa persona inicia sesión en la app):
--
--   insert into public.admins (email) values ('tu-correo@empresa.com');
--
create table if not exists public.admins (
  email text primary key
);

comment on table public.admins is 'Correos con permiso para gestionar el catálogo de beneficios desde el panel admin.';

alter table public.admins enable row level security;

drop policy if exists "Un usuario autenticado puede verificar si es admin" on public.admins;

create policy "Un usuario autenticado puede verificar si es admin"
  on public.admins
  for select
  to authenticated
  using (email = (auth.jwt() ->> 'email'));

-- Solo los correos presentes en `admins` pueden crear, editar o eliminar
-- beneficios; el resto de usuarios autenticados conserva solo lectura
-- (política de la sección 2).
drop policy if exists "Escritura de beneficios solo para administradores" on public.beneficios;

create policy "Escritura de beneficios solo para administradores"
  on public.beneficios
  for all
  to authenticated
  using (exists (select 1 from public.admins a where a.email = (auth.jwt() ->> 'email')))
  with check (exists (select 1 from public.admins a where a.email = (auth.jwt() ->> 'email')));
