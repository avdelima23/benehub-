// ============================================================================
// BeneHub — Lógica de la aplicación
// Vanilla JavaScript, sin frameworks. Usa el cliente Supabase v2 cargado
// desde CDN en index.html (variable global `supabase`).
// ============================================================================

/* ----------------------------------------------------------------------
   1. DATOS DE DEMOSTRACIÓN (se usan si no hay conexión válida a Supabase)
   ---------------------------------------------------------------------- */
const BENEFICIOS_DEMO = [
  // ---------------- SALUD ----------------
  {
    id: 'demo-1',
    nombre: 'Plan Odontológico Integral',
    categoria: 'Salud',
    descripcion: 'Cobertura completa de salud oral para el colaborador y su núcleo familiar directo.',
    cobertura: 'Incluye limpiezas semestrales, radiografías, resinas, extracciones simples y un 50% de descuento en ortodoncia.',
    proveedor_nombre: 'OdontoPlus S.A.',
    proveedor_url: 'https://www.example.com/odontoplus',
    facilitador_nombre: 'Camila Rojas',
    facilitador_email: 'camila.rojas@empresa.com',
    facilitador_telefono: '+57 300 123 4567',
    palabras_clave: ['odontólogo', 'dientes', 'dental', 'muela', 'ortodoncia', 'limpieza dental']
  },
  {
    id: 'demo-2',
    nombre: 'Seguro Médico Complementario',
    categoria: 'Salud',
    descripcion: 'Seguro privado que complementa la EPS con acceso a clínicas y especialistas de alta calidad.',
    cobertura: 'Consultas médicas generales y especializadas, exámenes de laboratorio, hospitalización y urgencias 24/7.',
    proveedor_nombre: 'Colsalud Seguros',
    proveedor_url: 'https://www.example.com/colsalud',
    facilitador_nombre: 'Andrés Muñoz',
    facilitador_email: 'andres.munoz@empresa.com',
    facilitador_telefono: '+57 300 234 5678',
    palabras_clave: ['médico', 'clínica', 'especialista', 'urgencias', 'hospital', 'eps']
  },
  {
    id: 'demo-3',
    nombre: 'Programa de Salud Visual',
    categoria: 'Salud',
    descripcion: 'Beneficio anual para el cuidado de la visión de los colaboradores.',
    cobertura: 'Examen visual gratuito una vez al año y bono de descuento del 40% en monturas y lentes de contacto.',
    proveedor_nombre: 'VisiónClara Óptica',
    proveedor_url: 'https://www.example.com/visionclara',
    facilitador_nombre: 'Camila Rojas',
    facilitador_email: 'camila.rojas@empresa.com',
    facilitador_telefono: '+57 300 123 4567',
    palabras_clave: ['ojos', 'lentes', 'gafas', 'oftalmólogo', 'optometría', 'visión']
  },

  // ---------------- BIENESTAR ----------------
  {
    id: 'demo-4',
    nombre: 'Membresía de Gimnasio Corporativa',
    categoria: 'Bienestar',
    descripcion: 'Acceso preferencial a la red de gimnasios aliados a nivel nacional.',
    cobertura: 'Descuento del 60% en la membresía mensual, clases grupales incluidas y acceso a más de 200 sedes.',
    proveedor_nombre: 'FitRed Nacional',
    proveedor_url: 'https://www.example.com/fitred',
    facilitador_nombre: 'Laura Gómez',
    facilitador_email: 'laura.gomez@empresa.com',
    facilitador_telefono: '+57 300 345 6789',
    palabras_clave: ['gimnasio', 'ejercicio', 'deporte', 'entrenamiento', 'fitness', 'pesas']
  },
  {
    id: 'demo-5',
    nombre: 'Acompañamiento Psicológico',
    categoria: 'Bienestar',
    descripcion: 'Sesiones confidenciales de apoyo emocional y salud mental para el colaborador y su familia.',
    cobertura: 'Hasta 6 sesiones anuales gratuitas con psicólogos certificados, presenciales o virtuales.',
    proveedor_nombre: 'MenteSana Psicología',
    proveedor_url: 'https://www.example.com/mentesana',
    facilitador_nombre: 'Laura Gómez',
    facilitador_email: 'laura.gomez@empresa.com',
    facilitador_telefono: '+57 300 345 6789',
    palabras_clave: ['psicólogo', 'salud mental', 'terapia', 'estrés', 'ansiedad', 'emocional']
  },
  {
    id: 'demo-6',
    nombre: 'Programa de Nutrición Personalizada',
    categoria: 'Bienestar',
    descripcion: 'Asesoría nutricional individual para mejorar hábitos alimenticios.',
    cobertura: 'Consulta inicial gratuita con nutricionista y plan alimenticio personalizado trimestral.',
    proveedor_nombre: 'NutriVida',
    proveedor_url: 'https://www.example.com/nutrivida',
    facilitador_nombre: 'Laura Gómez',
    facilitador_email: 'laura.gomez@empresa.com',
    facilitador_telefono: '+57 300 345 6789',
    palabras_clave: ['nutrición', 'dieta', 'alimentación', 'nutricionista', 'peso']
  },

  // ---------------- FINANZAS ----------------
  {
    id: 'demo-7',
    nombre: 'Fondo de Ahorro Voluntario',
    categoria: 'Finanzas',
    descripcion: 'Programa de ahorro programado con aporte adicional de la empresa.',
    cobertura: 'La empresa aporta el 25% adicional sobre el ahorro mensual del colaborador, hasta un tope definido.',
    proveedor_nombre: 'Fiduciaria Crece',
    proveedor_url: 'https://www.example.com/fiducrece',
    facilitador_nombre: 'Diego Fernández',
    facilitador_email: 'diego.fernandez@empresa.com',
    facilitador_telefono: '+57 300 456 7890',
    palabras_clave: ['ahorro', 'fondo', 'dinero', 'inversión', 'finanzas personales']
  },
  {
    id: 'demo-8',
    nombre: 'Asesoría Financiera Gratuita',
    categoria: 'Finanzas',
    descripcion: 'Orientación personalizada para la planeación financiera y tributaria.',
    cobertura: 'Dos sesiones anuales gratuitas con asesores certificados sobre presupuesto, crédito e impuestos.',
    proveedor_nombre: 'Consultora Patrimonio',
    proveedor_url: 'https://www.example.com/patrimonio',
    facilitador_nombre: 'Diego Fernández',
    facilitador_email: 'diego.fernandez@empresa.com',
    facilitador_telefono: '+57 300 456 7890',
    palabras_clave: ['asesoría', 'impuestos', 'presupuesto', 'crédito', 'planeación financiera']
  },
  {
    id: 'demo-9',
    nombre: 'Crédito de Libre Inversión Preferencial',
    categoria: 'Finanzas',
    descripcion: 'Línea de crédito con tasas preferenciales exclusivas para colaboradores.',
    cobertura: 'Tasa de interés reducida y desembolso prioritario en menos de 5 días hábiles.',
    proveedor_nombre: 'Banco Aliado',
    proveedor_url: 'https://www.example.com/bancoaliado',
    facilitador_nombre: 'Diego Fernández',
    facilitador_email: 'diego.fernandez@empresa.com',
    facilitador_telefono: '+57 300 456 7890',
    palabras_clave: ['crédito', 'préstamo', 'banco', 'tasa de interés', 'financiamiento']
  },

  // ---------------- TIEMPO LIBRE ----------------
  {
    id: 'demo-10',
    nombre: 'Club de Beneficios en Entretenimiento',
    categoria: 'Tiempo Libre',
    descripcion: 'Descuentos exclusivos en cine, streaming y eventos culturales.',
    cobertura: 'Hasta 40% de descuento en boletería de cine y 2 meses gratis en plataformas de streaming aliadas.',
    proveedor_nombre: 'ClubOcio',
    proveedor_url: 'https://www.example.com/clubocio',
    facilitador_nombre: 'Mariana Torres',
    facilitador_email: 'mariana.torres@empresa.com',
    facilitador_telefono: '+57 300 567 8901',
    palabras_clave: ['cine', 'streaming', 'entretenimiento', 'ocio', 'eventos', 'cultura']
  },
  {
    id: 'demo-11',
    nombre: 'Programa de Viajes y Turismo',
    categoria: 'Tiempo Libre',
    descripcion: 'Tarifas corporativas especiales para planes de viaje y vacaciones.',
    cobertura: 'Descuentos de hasta el 30% en paquetes turísticos nacionales e internacionales seleccionados.',
    proveedor_nombre: 'ViajaMás Agencia',
    proveedor_url: 'https://www.example.com/viajamas',
    facilitador_nombre: 'Mariana Torres',
    facilitador_email: 'mariana.torres@empresa.com',
    facilitador_telefono: '+57 300 567 8901',
    palabras_clave: ['viajes', 'turismo', 'vacaciones', 'hotel', 'tiquetes']
  },
  {
    id: 'demo-12',
    nombre: 'Días de Voluntariado Corporativo',
    categoria: 'Tiempo Libre',
    descripcion: 'Tiempo remunerado destinado a actividades de voluntariado y responsabilidad social.',
    cobertura: 'Hasta 2 días al año con goce de sueldo para participar en actividades de voluntariado avaladas.',
    proveedor_nombre: 'Fundación ManosUnidas',
    proveedor_url: 'https://www.example.com/manosunidas',
    facilitador_nombre: 'Mariana Torres',
    facilitador_email: 'mariana.torres@empresa.com',
    facilitador_telefono: '+57 300 567 8901',
    palabras_clave: ['voluntariado', 'fundación', 'responsabilidad social', 'comunidad']
  }
];

/* ----------------------------------------------------------------------
   2. ESTADO GLOBAL Y CLIENTE SUPABASE
   ---------------------------------------------------------------------- */
const state = {
  supabaseClient: null,
  modoDemo: true,
  usuario: null,
  beneficios: [],
  categoriaActiva: 'todas',
  textoBusqueda: ''
};

const CATEGORIA_CLASE = {
  'Salud': 'cat-salud',
  'Bienestar': 'cat-bienestar',
  'Finanzas': 'cat-finanzas',
  'Tiempo Libre': 'cat-tiempo-libre'
};

function esConfiguracionValida() {
  return (
    typeof SUPABASE_URL === 'string' &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('tu-proyecto') &&
    !SUPABASE_ANON_KEY.includes('tu-clave-anonima')
  );
}

function inicializarSupabase() {
  if (!esConfiguracionValida() || typeof window.supabase === 'undefined') {
    state.modoDemo = true;
    return;
  }
  try {
    state.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    state.modoDemo = false;
  } catch (error) {
    console.error('Error al inicializar Supabase:', error);
    state.modoDemo = true;
  }
}

/* ----------------------------------------------------------------------
   3. UTILIDADES DE BÚSQUEDA (normalización de texto)
   ---------------------------------------------------------------------- */
function normalizarTexto(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // elimina tildes/acentos
    .toLowerCase()
    .trim();
}

// Palabras vacías que se ignoran para permitir búsquedas en lenguaje natural
// (ej.: "necesito un odontólogo" debe encontrar el plan odontológico)
const PALABRAS_VACIAS = new Set([
  'a', 'al', 'ante', 'con', 'de', 'del', 'donde', 'el', 'ella', 'ellas', 'ellos',
  'en', 'es', 'esta', 'este', 'esto', 'la', 'las', 'lo', 'los', 'mi', 'mis',
  'necesito', 'necesita', 'para', 'por', 'que', 'quiero', 'quisiera', 'se',
  'si', 'sobre', 'soy', 'su', 'sus', 'tengo', 'tiene', 'un', 'una', 'unas', 'unos', 'y'
]);

function obtenerTerminosBusqueda(textoNormalizado) {
  const terminos = textoNormalizado.split(/\s+/).filter(Boolean);
  const relevantes = terminos.filter((termino) => !PALABRAS_VACIAS.has(termino));
  // Si tras filtrar palabras vacías no queda ningún término (ej.: solo se
  // escribieron conectores), se usan los términos originales para no
  // ocultar resultados de forma inesperada.
  return relevantes.length > 0 ? relevantes : terminos;
}

function beneficioCoincideConBusqueda(beneficio, textoNormalizado) {
  if (!textoNormalizado) return true;

  const camposTexto = [
    beneficio.nombre,
    beneficio.descripcion,
    beneficio.categoria,
    ...(beneficio.palabras_clave || [])
  ];

  const terminos = obtenerTerminosBusqueda(textoNormalizado);

  // Cada término relevante de búsqueda debe encontrarse en al menos un campo
  return terminos.every((termino) =>
    camposTexto.some((campo) => normalizarTexto(campo).includes(termino))
  );
}

/* ----------------------------------------------------------------------
   4. CARGA DE BENEFICIOS
   ---------------------------------------------------------------------- */
async function cargarBeneficios() {
  if (state.modoDemo) {
    state.beneficios = BENEFICIOS_DEMO;
    mostrarAvisoDemo(true);
    return;
  }

  const { data, error } = await state.supabaseClient
    .from('beneficios')
    .select('*')
    .order('categoria', { ascending: true });

  if (error) {
    console.error('Error al cargar beneficios desde Supabase, usando modo demo:', error);
    state.modoDemo = true;
    state.beneficios = BENEFICIOS_DEMO;
    mostrarAvisoDemo(true);
    return;
  }

  if (!data || data.length === 0) {
    // Tabla conectada pero vacía: se conserva la conexión real, sin datos de ejemplo forzados
    state.beneficios = [];
    mostrarAvisoDemo(false);
    return;
  }

  state.beneficios = data;
  mostrarAvisoDemo(false);
}

function mostrarAvisoDemo(mostrar) {
  const banner = document.getElementById('demo-banner');
  banner.hidden = !mostrar;
}

/* ----------------------------------------------------------------------
   5. RENDERIZADO DEL PORTAL
   ---------------------------------------------------------------------- */
function obtenerBeneficiosFiltrados() {
  const textoNormalizado = normalizarTexto(state.textoBusqueda);

  return state.beneficios.filter((beneficio) => {
    const coincideCategoria =
      state.categoriaActiva === 'todas' || beneficio.categoria === state.categoriaActiva;
    const coincideBusqueda = beneficioCoincideConBusqueda(beneficio, textoNormalizado);
    return coincideCategoria && coincideBusqueda;
  });
}

function crearTarjetaBeneficio(beneficio) {
  const claseCategoria = CATEGORIA_CLASE[beneficio.categoria] || '';

  const card = document.createElement('article');
  card.className = 'benefit-card';
  card.style.setProperty('--card-color', `var(--color-${claseCategoria.replace('cat-', '')})`);
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Ver detalle de ${beneficio.nombre}`);

  const badge = document.createElement('span');
  badge.className = `category-badge ${claseCategoria}`;
  badge.textContent = beneficio.categoria;

  const titulo = document.createElement('h3');
  titulo.textContent = beneficio.nombre;

  const desc = document.createElement('p');
  desc.className = 'benefit-card-desc';
  desc.textContent = beneficio.descripcion;

  const footer = document.createElement('p');
  footer.className = 'benefit-card-footer';
  footer.textContent = 'Ver detalle →';

  card.append(badge, titulo, desc, footer);

  const abrir = () => abrirModalBeneficio(beneficio);
  card.addEventListener('click', abrir);
  card.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      abrir();
    }
  });

  return card;
}

function renderizarBeneficios() {
  const grid = document.getElementById('benefits-grid');
  const emptyState = document.getElementById('empty-state');
  const resultsCount = document.getElementById('results-count');

  const filtrados = obtenerBeneficiosFiltrados();

  grid.innerHTML = '';
  filtrados.forEach((beneficio) => grid.appendChild(crearTarjetaBeneficio(beneficio)));

  emptyState.hidden = filtrados.length !== 0;
  resultsCount.textContent =
    filtrados.length === 1 ? '1 beneficio encontrado' : `${filtrados.length} beneficios encontrados`;
}

/* ----------------------------------------------------------------------
   6. MODAL DE DETALLE
   ---------------------------------------------------------------------- */
function abrirModalBeneficio(beneficio) {
  const claseCategoria = CATEGORIA_CLASE[beneficio.categoria] || '';

  const badge = document.getElementById('modal-category-badge');
  badge.className = `category-badge ${claseCategoria}`;
  badge.textContent = beneficio.categoria;

  document.getElementById('modal-title').textContent = beneficio.nombre;
  document.getElementById('modal-description').textContent = beneficio.descripcion;
  document.getElementById('modal-coverage').textContent = beneficio.cobertura;

  document.getElementById('modal-provider-name').textContent = beneficio.proveedor_nombre;
  const enlaceProveedor = document.getElementById('modal-provider-link');
  enlaceProveedor.href = beneficio.proveedor_url;

  document.getElementById('modal-facilitator-name').textContent = beneficio.facilitador_nombre;
  document.getElementById('modal-facilitator-email').textContent = `✉️ ${beneficio.facilitador_email}`;
  document.getElementById('modal-facilitator-phone').textContent = `📞 ${beneficio.facilitador_telefono}`;

  const modal = document.getElementById('benefit-modal');
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function cerrarModalBeneficio() {
  const modal = document.getElementById('benefit-modal');
  modal.hidden = true;
  document.body.style.overflow = '';
}

/* ----------------------------------------------------------------------
   7. AUTENTICACIÓN
   ---------------------------------------------------------------------- */
function mostrarMensajeAuth(texto, tipo) {
  const mensaje = document.getElementById('auth-message');
  mensaje.textContent = texto;
  mensaje.className = `auth-message ${tipo || ''}`.trim();
}

async function manejarInicioSesion(email, password) {
  if (state.modoDemo) {
    // En modo demo se simula el ingreso sin backend real
    state.usuario = { email };
    mostrarPortal();
    return;
  }

  const { data, error } = await state.supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    mostrarMensajeAuth(traducirErrorAuth(error), 'error');
    return;
  }
  state.usuario = data.user;
  mostrarPortal();
}

async function manejarCrearCuenta(email, password) {
  if (state.modoDemo) {
    state.usuario = { email };
    mostrarPortal();
    return;
  }

  const { data, error } = await state.supabaseClient.auth.signUp({ email, password });
  if (error) {
    mostrarMensajeAuth(traducirErrorAuth(error), 'error');
    return;
  }

  if (data.user && !data.session) {
    mostrarMensajeAuth('Cuenta creada. Revisa tu correo para confirmar el registro.', 'success');
    return;
  }

  state.usuario = data.user;
  mostrarPortal();
}

async function manejarCerrarSesion() {
  if (!state.modoDemo && state.supabaseClient) {
    await state.supabaseClient.auth.signOut();
  }
  state.usuario = null;
  mostrarAuth();
}

function traducirErrorAuth(error) {
  const mensaje = (error && error.message) || 'Ocurrió un error inesperado.';
  if (mensaje.includes('Invalid login credentials')) {
    return 'Correo o contraseña incorrectos.';
  }
  if (mensaje.includes('User already registered')) {
    return 'Ya existe una cuenta con este correo. Intenta iniciar sesión.';
  }
  if (mensaje.includes('Password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return mensaje;
}

/* ----------------------------------------------------------------------
   8. NAVEGACIÓN ENTRE PANTALLAS
   ---------------------------------------------------------------------- */
function mostrarAuth() {
  document.getElementById('auth-screen').hidden = false;
  document.getElementById('portal-screen').hidden = true;
  document.getElementById('auth-form').reset();
  mostrarMensajeAuth('', '');
}

async function mostrarPortal() {
  document.getElementById('auth-screen').hidden = true;
  document.getElementById('portal-screen').hidden = false;
  document.getElementById('user-email').textContent = state.usuario ? state.usuario.email : '';

  await cargarBeneficios();
  renderizarBeneficios();
  await actualizarEnlaceAdmin();
}

async function actualizarEnlaceAdmin() {
  const enlaceAdmin = document.getElementById('admin-link');
  if (state.modoDemo || !state.usuario) {
    enlaceAdmin.hidden = true;
    return;
  }

  const { data, error } = await state.supabaseClient
    .from('admins')
    .select('email')
    .eq('email', state.usuario.email)
    .maybeSingle();

  enlaceAdmin.hidden = Boolean(error) || !data;
}

/* ----------------------------------------------------------------------
   9. EVENTOS
   ---------------------------------------------------------------------- */
function configurarEventos() {
  const form = document.getElementById('auth-form');
  const btnSignup = document.getElementById('btn-signup');
  const btnLogout = document.getElementById('btn-logout');
  const searchInput = document.getElementById('search-input');
  const categoryFilters = document.getElementById('category-filters');
  const modal = document.getElementById('benefit-modal');
  const modalClose = document.getElementById('modal-close');

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    mostrarMensajeAuth('Iniciando sesión...', '');
    await manejarInicioSesion(email, password);
  });

  btnSignup.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if (!email || !password) {
      mostrarMensajeAuth('Completa correo y contraseña para crear tu cuenta.', 'error');
      return;
    }
    mostrarMensajeAuth('Creando cuenta...', '');
    await manejarCrearCuenta(email, password);
  });

  btnLogout.addEventListener('click', manejarCerrarSesion);

  searchInput.addEventListener('input', (evento) => {
    state.textoBusqueda = evento.target.value;
    renderizarBeneficios();
  });

  categoryFilters.addEventListener('click', (evento) => {
    const chip = evento.target.closest('.filter-chip');
    if (!chip) return;

    categoryFilters.querySelectorAll('.filter-chip').forEach((el) => {
      el.classList.remove('active');
      el.setAttribute('aria-selected', 'false');
    });
    chip.classList.add('active');
    chip.setAttribute('aria-selected', 'true');

    state.categoriaActiva = chip.dataset.category;
    renderizarBeneficios();
  });

  modalClose.addEventListener('click', cerrarModalBeneficio);
  modal.addEventListener('click', (evento) => {
    if (evento.target === modal) cerrarModalBeneficio();
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !modal.hidden) cerrarModalBeneficio();
  });
}

/* ----------------------------------------------------------------------
   10. INICIALIZACIÓN DE LA APLICACIÓN
   ---------------------------------------------------------------------- */
async function inicializarApp() {
  inicializarSupabase();
  configurarEventos();

  if (!state.modoDemo && state.supabaseClient) {
    const { data } = await state.supabaseClient.auth.getSession();
    if (data && data.session) {
      state.usuario = data.session.user;
      await mostrarPortal();
      return;
    }

    state.supabaseClient.auth.onAuthStateChange((_evento, session) => {
      if (!session) {
        state.usuario = null;
        mostrarAuth();
      }
    });
  }

  mostrarAuth();
}

document.addEventListener('DOMContentLoaded', inicializarApp);
