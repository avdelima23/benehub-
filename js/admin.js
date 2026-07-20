// ============================================================================
// BeneHub — Panel de administración
// Permite a los correos registrados en la tabla `admins` de Supabase crear,
// editar y eliminar beneficios. El control de acceso real ocurre en el
// servidor mediante Row Level Security (ver supabase/schema.sql); las
// comprobaciones aquí solo mejoran la experiencia de usuario.
// ============================================================================

const CATEGORIAS_VALIDAS = ['Salud', 'Bienestar', 'Finanzas', 'Tiempo Libre'];

const state = {
  supabaseClient: null,
  modoDemo: true,
  usuario: null,
  beneficios: []
};

/* ----------------------------------------------------------------------
   Configuración e inicialización de Supabase (igual criterio que app.js)
   ---------------------------------------------------------------------- */
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
   Mensajes de estado (bloquean el panel cuando no hay acceso)
   ---------------------------------------------------------------------- */
function mostrarMensajeEstado(texto, tipo) {
  const mensaje = document.getElementById('admin-status-message');
  mensaje.textContent = texto;
  mensaje.className = `admin-status-message ${tipo || ''}`.trim();
  mensaje.hidden = !texto;
}

/* ----------------------------------------------------------------------
   Verificación de sesión y permisos de administrador
   ---------------------------------------------------------------------- */
async function verificarEsAdmin() {
  const { data, error } = await state.supabaseClient
    .from('admins')
    .select('email')
    .eq('email', state.usuario.email)
    .maybeSingle();

  if (error) {
    console.error('Error al verificar permisos de administrador:', error);
    return false;
  }
  return Boolean(data);
}

/* ----------------------------------------------------------------------
   Carga y render de la tabla de beneficios
   ---------------------------------------------------------------------- */
async function cargarBeneficiosAdmin() {
  const { data, error } = await state.supabaseClient
    .from('beneficios')
    .select('*')
    .order('categoria', { ascending: true })
    .order('nombre', { ascending: true });

  if (error) {
    mostrarMensajeEstado(`Error al cargar los beneficios: ${error.message}`, 'error');
    return;
  }

  state.beneficios = data || [];
  renderizarTablaAdmin();
}

function renderizarTablaAdmin() {
  const cuerpo = document.getElementById('admin-table-body');
  const contador = document.getElementById('admin-count');
  cuerpo.innerHTML = '';
  contador.textContent = state.beneficios.length;

  state.beneficios.forEach((beneficio) => {
    const fila = document.createElement('tr');

    const celdaNombre = document.createElement('td');
    celdaNombre.textContent = beneficio.nombre;

    const celdaCategoria = document.createElement('td');
    celdaCategoria.textContent = beneficio.categoria;

    const celdaProveedor = document.createElement('td');
    celdaProveedor.textContent = beneficio.proveedor_nombre;

    const celdaFacilitador = document.createElement('td');
    celdaFacilitador.textContent = beneficio.facilitador_nombre;

    const celdaAcciones = document.createElement('td');
    celdaAcciones.className = 'admin-actions';

    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-outline btn-sm';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => abrirFormulario(beneficio));

    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-danger btn-sm';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarBeneficio(beneficio));

    celdaAcciones.append(btnEditar, btnEliminar);
    fila.append(celdaNombre, celdaCategoria, celdaProveedor, celdaFacilitador, celdaAcciones);
    cuerpo.appendChild(fila);
  });
}

/* ----------------------------------------------------------------------
   Formulario de creación / edición
   ---------------------------------------------------------------------- */
function abrirFormulario(beneficio) {
  document.getElementById('admin-form').reset();
  document.getElementById('admin-form-message').textContent = '';
  document.getElementById('f-id').value = beneficio ? beneficio.id : '';
  document.getElementById('admin-modal-title').textContent = beneficio ? 'Editar beneficio' : 'Nuevo beneficio';

  document.getElementById('f-nombre').value = beneficio ? beneficio.nombre : '';
  document.getElementById('f-categoria').value = beneficio ? beneficio.categoria : CATEGORIAS_VALIDAS[0];
  document.getElementById('f-descripcion').value = beneficio ? beneficio.descripcion : '';
  document.getElementById('f-cobertura').value = beneficio ? beneficio.cobertura : '';
  document.getElementById('f-proveedor-nombre').value = beneficio ? beneficio.proveedor_nombre : '';
  document.getElementById('f-proveedor-url').value = beneficio ? beneficio.proveedor_url : '';
  document.getElementById('f-facilitador-nombre').value = beneficio ? beneficio.facilitador_nombre : '';
  document.getElementById('f-facilitador-email').value = beneficio ? beneficio.facilitador_email : '';
  document.getElementById('f-facilitador-telefono').value = beneficio ? beneficio.facilitador_telefono : '';
  document.getElementById('f-palabras-clave').value = beneficio ? (beneficio.palabras_clave || []).join(', ') : '';

  document.getElementById('admin-modal').hidden = false;
  document.body.style.overflow = 'hidden';
}

function cerrarFormulario() {
  document.getElementById('admin-modal').hidden = true;
  document.body.style.overflow = '';
}

function leerDatosFormulario() {
  const palabrasClaveTexto = document.getElementById('f-palabras-clave').value;
  const palabrasClave = palabrasClaveTexto
    .split(',')
    .map((palabra) => palabra.trim())
    .filter(Boolean);

  return {
    nombre: document.getElementById('f-nombre').value.trim(),
    categoria: document.getElementById('f-categoria').value,
    descripcion: document.getElementById('f-descripcion').value.trim(),
    cobertura: document.getElementById('f-cobertura').value.trim(),
    proveedor_nombre: document.getElementById('f-proveedor-nombre').value.trim(),
    proveedor_url: document.getElementById('f-proveedor-url').value.trim(),
    facilitador_nombre: document.getElementById('f-facilitador-nombre').value.trim(),
    facilitador_email: document.getElementById('f-facilitador-email').value.trim(),
    facilitador_telefono: document.getElementById('f-facilitador-telefono').value.trim(),
    palabras_clave: palabrasClave
  };
}

async function guardarBeneficio(evento) {
  evento.preventDefault();
  const mensaje = document.getElementById('admin-form-message');
  mensaje.className = 'auth-message';
  mensaje.textContent = 'Guardando...';

  const id = document.getElementById('f-id').value;
  const datos = leerDatosFormulario();

  const { error } = id
    ? await state.supabaseClient.from('beneficios').update(datos).eq('id', id)
    : await state.supabaseClient.from('beneficios').insert([datos]);

  if (error) {
    mensaje.textContent = `Error al guardar: ${error.message}`;
    mensaje.className = 'auth-message error';
    return;
  }

  cerrarFormulario();
  await cargarBeneficiosAdmin();
}

async function eliminarBeneficio(beneficio) {
  const confirmado = window.confirm(`¿Eliminar el beneficio "${beneficio.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmado) return;

  const { error } = await state.supabaseClient.from('beneficios').delete().eq('id', beneficio.id);
  if (error) {
    mostrarMensajeEstado(`Error al eliminar: ${error.message}`, 'error');
    return;
  }

  await cargarBeneficiosAdmin();
}

/* ----------------------------------------------------------------------
   Eventos
   ---------------------------------------------------------------------- */
function configurarEventosAdmin() {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    if (state.supabaseClient) {
      await state.supabaseClient.auth.signOut();
    }
    window.location.href = 'index.html';
  });

  document.getElementById('btn-new-benefit').addEventListener('click', () => abrirFormulario(null));
  document.getElementById('admin-modal-close').addEventListener('click', cerrarFormulario);
  document.getElementById('admin-cancel').addEventListener('click', cerrarFormulario);
  document.getElementById('admin-form').addEventListener('submit', guardarBeneficio);

  const modal = document.getElementById('admin-modal');
  modal.addEventListener('click', (evento) => {
    if (evento.target === modal) cerrarFormulario();
  });
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && !modal.hidden) cerrarFormulario();
  });
}

/* ----------------------------------------------------------------------
   Inicialización
   ---------------------------------------------------------------------- */
async function inicializarAdmin() {
  inicializarSupabase();
  configurarEventosAdmin();

  if (state.modoDemo) {
    mostrarMensajeEstado(
      'El panel de administración requiere una conexión real a Supabase configurada en js/config.js. Actualmente la aplicación está en modo demo.',
      'error'
    );
    return;
  }

  const { data: sesionData } = await state.supabaseClient.auth.getSession();
  if (!sesionData || !sesionData.session) {
    mostrarMensajeEstado('Debes iniciar sesión en el portal antes de acceder al panel de administración.', 'error');
    return;
  }

  state.usuario = sesionData.session.user;
  document.getElementById('user-email').textContent = state.usuario.email;

  const esAdmin = await verificarEsAdmin();
  if (!esAdmin) {
    mostrarMensajeEstado(
      'Tu cuenta no tiene permisos de administrador. Pide a un administrador que agregue tu correo a la tabla "admins" en Supabase.',
      'error'
    );
    return;
  }

  document.getElementById('admin-content').hidden = false;
  await cargarBeneficiosAdmin();
}

document.addEventListener('DOMContentLoaded', inicializarAdmin);
