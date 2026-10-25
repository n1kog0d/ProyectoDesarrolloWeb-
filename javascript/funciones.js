// ============================================================
// funciones.js — Hourtz
// ============================================================

// ---------- Registro: validación en tiempo real de contraseñas ----------
const contraseña = document.getElementById("contraseña");
const Confcontraseña = document.getElementById("contraseñaC");
const alerta = document.getElementById("alerta");
const botonE = document.getElementById("Registro");

if (Confcontraseña && contraseña) {
  Confcontraseña.addEventListener("input", function() {
    if (contraseña.value !== Confcontraseña.value) {
      if (alerta) alerta.textContent = "Las contraseñas no coinciden";
      if (botonE) botonE.disabled = true;
    } else {
      if (alerta) alerta.textContent = "";
      if (botonE) botonE.disabled = false;
    }
  });
}

// ---------- Reproductor de audio ----------
let currentAudio = null;
let currentButton = null;
let currentAudioSrc = null;

const playButtons = document.querySelectorAll('.play-btn');
playButtons.forEach(button => {
  button.addEventListener('click', () => manejarReproduccion(button));
});

async function manejarReproduccion(button) {
  const audioSrc = button.getAttribute('data-audio');
  if (!audioSrc) return;

  if (currentAudio && currentAudioSrc === audioSrc) {
    if (currentAudio.paused) {
      await currentAudio.play();
    } else {
      currentAudio.pause();
    }
    currentButton = button;
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    const prevSrc = currentAudioSrc;
    if (prevSrc) {
      document.querySelectorAll(`[data-audio="${CSS.escape(prevSrc)}"]`)
        .forEach(b => { b.textContent = 'Probar'; });
    }
  }

  const audio = new Audio(audioSrc);
  audio.volume = 0.2;
  currentAudio = audio;
  currentAudioSrc = audioSrc;
  currentButton = button;

  audio.addEventListener('play', () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = 'Pausar'; });
  });
  audio.addEventListener('pause', () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = 'Probar'; });
  });
  audio.addEventListener('ended', () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = 'Probar'; });
    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
      currentAudioSrc = null;
    }
  });

  try {
    await audio.play();
  } catch (err) {
    console.error("Playback failed. Verify file path and format:", err);
    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
      currentAudioSrc = null;
    }
  }
}

// ---------- Autosave del nombre de usuario ----------
let user = document.getElementById("user");
if (user != null) {
  if (sessionStorage.getItem("autosave")) user.value = sessionStorage.getItem("autosave");
  user.addEventListener("change", () => { sessionStorage.setItem("autosave", user.value); });
}

// ---------- Navbar: nombre de usuario ----------
const userName = document.getElementById("userName");
let usuarioGuardado = sessionStorage.getItem("autosave");

if (usuarioGuardado != null) {
  if (userName != null) userName.textContent = usuarioGuardado;
} else {
  if (userName != null) userName.textContent = "Perfil";
}

// ============================================================
// PERFIL DINÁMICO
// ============================================================

let usuarioActual = null;

async function cargarDatosAuth() {
  try {
    const res = await fetch("../Json/users.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.usuarios || [];
  } catch (e) {
    console.error("Error leyendo datos.json:", e);
    return [];
  }
}

function obtenerUsuariosLocales() {
  return JSON.parse(sessionStorage.getItem("usuariosLocales") || "[]");
}

async function obtenerUsuarioCompleto() {
  const sesion = obtenerSesion();
  if (!sesion) return null;

  const parches = JSON.parse(sessionStorage.getItem("parchesPerfil") || "{}");
  const parche = parches[sesion.id] || {};

  const locales = obtenerUsuariosLocales();
  const enLocal = locales.find(u => u.id === sesion.id);
  if (enLocal) return { ...enLocal, ...parche };

  const delJSON = await cargarDatosAuth();
  const delJSONUsuario = delJSON.find(u => u.id === sesion.id);
  return { ...(delJSONUsuario || sesion), ...parche };
}

function pintarLista(idContenedor, items) {
  const ul = document.getElementById(idContenedor);
  if (!ul) return;

  if (!items || items.length === 0) {
    ul.innerHTML = '<li class="mb-2 text-muted">Sin datos</li>';
    return;
  }

  ul.innerHTML = items.map(txt => `<li class="mb-2">${txt}</li>`).join('');
}

function pintarPerfil(usuario) {
  usuarioActual = usuario;

  const nombreEl  = document.getElementById("nombre_perfil");
  const apodoEl   = document.getElementById("apodo_perfil");
  const fotoEl    = document.getElementById("imagen_perfil_visual");
  const sobreMiEl = document.getElementById("sobre_mi_visual");
  const statPl    = document.getElementById("stat_playlists");
  const statSeg   = document.getElementById("stat_seguidores");

  if (!usuario) {
    if (nombreEl) nombreEl.textContent = "Usuario Invitado";
    if (apodoEl)  apodoEl.textContent  = "@usuario_invitado";
    if (statPl)   statPl.textContent   = "0";
    if (statSeg)  statSeg.textContent  = "0";
    pintarLista("lista_generos", []);
    pintarLista("lista_artistas", []);
    pintarLista("lista_escuchadas", []);
    pintarLista("lista_playlists", []);
    return;
  }

  if (nombreEl) nombreEl.textContent = usuario.nombre || usuario.usuario || "Usuario";
  if (apodoEl)  apodoEl.textContent  = "@" + (usuario.usuario || "").toLowerCase();
  if (fotoEl && usuario.avatar) fotoEl.src = usuario.avatar;
  if (sobreMiEl && usuario.sobreMi) sobreMiEl.textContent = usuario.sobreMi;

  const playlists = usuario.playlists || [];
  if (statPl)  statPl.textContent  = playlists.length;
  if (statSeg) statSeg.textContent = usuario.seguidores || 0;

  pintarLista("lista_generos",    usuario.generos            || []);
  pintarLista("lista_artistas",   usuario.artistas_favoritos || []);
  pintarLista("lista_escuchadas", usuario.mas_escuchadas     || []);

  const nombresPlaylists = playlists.map(p =>
    typeof p === "string" ? p : (p.nombre || "Playlist")
  );
  pintarLista("lista_playlists", nombresPlaylists);
}

// Ejecutar solo en perfil.html
document.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("nombre_perfil")) return;
  const usuario = await obtenerUsuarioCompleto();
  pintarPerfil(usuario);
});

// ============================================================
// MODAL EDITAR PERFIL
// ============================================================

const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
if (btnGuardarPerfil != null) {
  btnGuardarPerfil.addEventListener("click", async function() {
    const sesion = obtenerSesion();
    if (!sesion) { alert("Debes iniciar sesión para editar tu perfil."); return; }

    const inputSobreMi = document.getElementById("inputSobreMi");
    const inputFoto    = document.getElementById("inputFoto");

    const cambios = {};

    if (inputSobreMi && inputSobreMi.value.trim() !== "") {
      cambios.sobreMi = inputSobreMi.value.trim();
    }

    if (inputFoto && inputFoto.files && inputFoto.files[0]) {
      cambios.avatar = await new Promise((res, rej) => {
        const lector = new FileReader();
        lector.onload = e => res(e.target.result);
        lector.onerror = rej;
        lector.readAsDataURL(inputFoto.files[0]);
      });
    }

    if (Object.keys(cambios).length === 0) {
      const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarPerfil"));
      if (modal) modal.hide();
      return;
    }

    const locales = obtenerUsuariosLocales();
    const idx = locales.findIndex(u => u.id === sesion.id);

    if (idx >= 0) {
      locales[idx] = { ...locales[idx], ...cambios };
      sessionStorage.setItem("usuariosLocales", JSON.stringify(locales));
    } else {
      const parches = JSON.parse(sessionStorage.getItem("parchesPerfil") || "{}");
      parches[sesion.id] = { ...(parches[sesion.id] || {}), ...cambios };
      sessionStorage.setItem("parchesPerfil", JSON.stringify(parches));
    }

    const usuario = await obtenerUsuarioCompleto();
    pintarPerfil(usuario);

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarPerfil"));
    if (modal) modal.hide();
  });
}

// Pre-rellenar el modal al abrir
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("modalEditarPerfil");
  if (!modalEl) return;
  modalEl.addEventListener("show.bs.modal", () => {
    const inputSobreMi = document.getElementById("inputSobreMi");
    const inputFoto    = document.getElementById("inputFoto");
    if (inputSobreMi && usuarioActual) inputSobreMi.value = usuarioActual.sobreMi || "";
    if (inputFoto) inputFoto.value = "";
  });
});

// ============================================================
// BUSCADOR
// ============================================================
const RUTA_JSON = '../Json/datos.json';
let datosCatalogo = [];

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('buscador');
  const contenedor = document.getElementById('resultadosBusqueda');
  if (!input || !contenedor) return;

  fetch(RUTA_JSON)
    .then(res => { if (!res.ok) throw new Error('JSON no disponible'); return res.json(); })
    .then(data => {
      datosCatalogo = Array.isArray(data) ? data : (data.canciones || []);
      console.log(`[Buscador] ${datosCatalogo.length} canciones cargadas.`);
    })
    .catch(err => console.warn('[Buscador] JSON no disponible:', err.message));

  function mostrarResultados(html) {
    contenedor.innerHTML = html;
    contenedor.style.display = 'block';
  }
  function ocultarResultados() {
    contenedor.innerHTML = '';
    contenedor.style.display = 'none';
  }

  input.addEventListener('input', () => {
    const termino = input.value.toLowerCase().trim();

    if (termino === '') { ocultarResultados(); return; }

    if (datosCatalogo.length === 0) {
      mostrarResultados('<div class="list-group-item text-muted">El catálogo aún no está disponible.</div>');
      return;
    }

    const resultados = datosCatalogo.filter(c =>
      (c.titulo  || '').toLowerCase().includes(termino) ||
      (c.artista || '').toLowerCase().includes(termino) ||
      (c.genero  || '').toLowerCase().includes(termino)
    );

    if (resultados.length === 0) {
      mostrarResultados('<div class="list-group-item text-muted">Sin resultados.</div>');
      return;
    }

    const html = resultados.slice(0, 8).map(c => `
      <div class="list-group-item d-flex align-items-center gap-2">
        ${c.imagen ? `<img src="${c.imagen}" alt="" style="width:36px;height:36px;object-fit:cover;" class="rounded">` : ''}
        <div class="flex-grow-1">
          <strong>${c.titulo || 'Sin título'}</strong><br>
          <small class="text-muted">${c.artista || ''}${c.genero ? ' · ' + c.genero : ''}</small>
        </div>
        <button 
          class="btn btn-sm btn-outline-primary play-btn-busqueda" 
          data-audio="${c.audio || ''}">
          ${(currentAudio && currentAudioSrc === c.audio && !currentAudio.paused) ? 'Pausar' : 'Probar'}
        </button>
      </div>
    `).join('');

    mostrarResultados(html);

    contenedor.querySelectorAll('.play-btn-busqueda').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        manejarReproduccion(btn);
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !contenedor.contains(e.target)) ocultarResultados();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') ocultarResultados();
  });
});

// ============================================================
// AUTENTICACIÓN
// ============================================================
const CLAVE_SESION_AUTH = "usuarioActivo";
const CLAVE_LOCAL_AUTH  = "usuariosLocales";

function guardarUsuarioLocal(usuario) {
  const locales = obtenerUsuariosLocales();
  locales.push(usuario);
  sessionStorage.setItem(CLAVE_LOCAL_AUTH, JSON.stringify(locales));
}

async function mostrarAlertalogin(event) {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password")
                 || document.querySelector('#login input[type="password"]');

  if (!emailInput || !passInput) {
    alert("No se encontraron los campos del formulario.");
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passInput.value;

  const usuariosJSON = await cargarDatosAuth();
  const usuariosLocales = obtenerUsuariosLocales();
  const todos = [...usuariosJSON, ...usuariosLocales];

  const usuario = todos.find(u =>
    (u.email   && u.email.toLowerCase()   === email) ||
    (u.usuario && u.usuario.toLowerCase() === email)
  );

  if (!usuario) { alert("No existe una cuenta con ese correo o usuario."); return; }
  if (usuario.password !== password) { alert("Contraseña incorrecta."); return; }

  const sesion = {
    id: usuario.id, nombre: usuario.nombre, usuario: usuario.usuario,
    email: usuario.email, rol: usuario.rol || "user"
  };
  sessionStorage.setItem(CLAVE_SESION_AUTH, JSON.stringify(sesion));
  sessionStorage.setItem("autosave", usuario.nombre);

  const toastHTML = document.getElementById("alertaExitologin");
  if (toastHTML) new bootstrap.Toast(toastHTML).show();

  setTimeout(() => { window.location.href = "index_logged.html"; }, 2000);
}

function mostrarAlertaregister(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombre")?.value.trim();
  const usuario = document.getElementById("user")?.value.trim();
  const email = document.getElementById("email")?.value.trim().toLowerCase();
  const pass = document.getElementById("contraseña")?.value;
  const passC = document.getElementById("contraseñaC")?.value;

  if (!nombre || !usuario || !email || !pass || !passC) { alert("Faltan campos obligatorios."); return; }
  if (pass !== passC) { alert("Las contraseñas no coinciden."); return; }
  if (pass.length < 8) { alert("La contraseña debe tener al menos 8 caracteres."); return; }

  const locales = obtenerUsuariosLocales();
  if (locales.some(u => u.email.toLowerCase() === email)) {
    alert("Ese correo ya está registrado en este navegador.");
    return;
  }

  guardarUsuarioLocal({
    id: Date.now(),
    nombre: nombre,
    usuario: usuario,
    email: email,
    password: pass,
    rol: "user",
    avatar: "../img/usuario-sin-foto.jpg",
    seguidores: 0,
    seguidos: 0,
    sobreMi: "",
    generos: [],
    artistas_favoritos: [],
    mas_escuchadas: [],
    playlists: []
  });

  const toastHTML = document.getElementById("alertaExitoregister");
  if (toastHTML) new bootstrap.Toast(toastHTML).show();

  setTimeout(() => { window.location.href = "login.html"; }, 2000);
}

// ---------- Utilidades de sesión ----------
function obtenerSesion() {
  const raw = sessionStorage.getItem("usuarioActivo");
  return raw ? JSON.parse(raw) : null;
}

function cerrarSesion(event) {
  if (event) event.preventDefault();
  sessionStorage.removeItem("usuarioActivo");
  sessionStorage.removeItem("autosave");
  const enSubcarpeta = window.location.pathname.toLowerCase().includes("/html/");
  window.location.href = enSubcarpeta ? "index.html" : "HTML/index.html";
}

/* ============================================================
   NAVBAR DINÁMICA — muestra/oculta según sesión activa
   ============================================================ */
function actualizarNavbar() {
  const haySesion    = !!obtenerSesion();
  const itemLogin    = document.getElementById("navItemLogin");
  const itemRegister = document.getElementById("navItemRegister");
  const itemLogout   = document.getElementById("navItemLogout");
  const brandLogo    = document.querySelector(".navbar-brand"); // <-- 1. Buscamos el logo "Hz"
  if (haySesion) {
    if (itemLogin)    itemLogin.classList.add("d-none");
    if (itemRegister) itemRegister.classList.add("d-none");
    if (itemLogout)   itemLogout.classList.remove("d-none");
    if (brandLogo)    brandLogo.href = "Index_logged.html";     // <-- 2. Si hay sesión, lleva a Index_logged.html
  } else {
    if (itemLogin)    itemLogin.classList.remove("d-none");
    if (itemRegister) itemRegister.classList.remove("d-none");
    if (itemLogout)   itemLogout.classList.add("d-none");
    if (brandLogo)    brandLogo.href = "index.html";            // <-- 3. Si no hay sesión, lleva a index.html
  }
}

document.addEventListener("DOMContentLoaded", actualizarNavbar);

