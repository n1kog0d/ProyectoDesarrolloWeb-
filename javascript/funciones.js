// ============================================================
// funciones.js — Hourtz
// Datos persistentes en localStorage; sesión en sessionStorage.
// ============================================================

const RUTA_USERS   = "../Json/users.json";
const RUTA_JSON    = "../Json/datos.json";
const CLAVE_SESION = "usuarioActivo";
const CLAVE_LOCAL  = "usuariosLocales";
const CLAVE_PARCHES = "parchesPerfil";
const CLAVE_AUTOSAVE = "autosave";

// ============================================================
// 1. UTILIDADES GENERALES
// ============================================================

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarUsuario(valor) {
  return String(valor || "").trim();
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parsearJSONSeguro(valor, fallback) {
  try {
    const dato = JSON.parse(valor);
    return dato ?? fallback;
  } catch {
    return fallback;
  }
}

// ============================================================
// 2. MIGRACIÓN: sessionStorage antiguo -> localStorage
// ============================================================

function migrarAlmacenamiento() {
  try {
    // Usuarios locales
    const localesLS = parsearJSONSeguro(localStorage.getItem(CLAVE_LOCAL), []);
    const localesSS = parsearJSONSeguro(sessionStorage.getItem(CLAVE_LOCAL), []);

    const mapaUsuarios = new Map();

    if (Array.isArray(localesLS)) {
      localesLS.forEach(u => {
        if (u && u.id != null) mapaUsuarios.set(String(u.id), u);
      });
    }

    if (Array.isArray(localesSS)) {
      localesSS.forEach(u => {
        if (u && u.id != null) mapaUsuarios.set(String(u.id), u);
      });
    }

    if (mapaUsuarios.size > 0) {
      localStorage.setItem(CLAVE_LOCAL, JSON.stringify([...mapaUsuarios.values()]));
    }

    if (localesSS && localesSS.length) {
      sessionStorage.removeItem(CLAVE_LOCAL);
    }

    // Parches de perfil
    const parchesLS = parsearJSONSeguro(localStorage.getItem(CLAVE_PARCHES), {});
    const parchesSS = parsearJSONSeguro(sessionStorage.getItem(CLAVE_PARCHES), {});

    const parchesFinales = {
      ...(typeof parchesLS === "object" && !Array.isArray(parchesLS) ? parchesLS : {}),
      ...(typeof parchesSS === "object" && !Array.isArray(parchesSS) ? parchesSS : {})
    };

    if (Object.keys(parchesFinales).length > 0) {
      localStorage.setItem(CLAVE_PARCHES, JSON.stringify(parchesFinales));
    }

    if (parchesSS && Object.keys(parchesSS).length > 0) {
      sessionStorage.removeItem(CLAVE_PARCHES);
    }
  } catch (e) {
    console.warn("[Almacenamiento] No se pudo migrar sessionStorage:", e);
  }
}

migrarAlmacenamiento();

// ============================================================
// 3. USUARIOS: JSON + localStorage
// ============================================================

async function cargarUsuariosJSON() {
  try {
    const res = await fetch(RUTA_USERS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.usuarios)) return data.usuarios;

    return [];
  } catch (e) {
    console.error("Error leyendo users.json:", e);
    return [];
  }
}

// Alias por compatibilidad con código anterior
async function cargarDatosAuth() {
  return cargarUsuariosJSON();
}

function obtenerUsuariosLocales() {
  const datos = parsearJSONSeguro(localStorage.getItem(CLAVE_LOCAL), []);
  return Array.isArray(datos) ? datos : [];
}

function guardarUsuariosLocales(usuarios) {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(Array.isArray(usuarios) ? usuarios : []));
}

function obtenerParches() {
  const datos = parsearJSONSeguro(localStorage.getItem(CLAVE_PARCHES), {});
  return (typeof datos === "object" && !Array.isArray(datos)) ? datos : {};
}

function guardarParches(parches) {
  localStorage.setItem(CLAVE_PARCHES, JSON.stringify(
    (typeof parches === "object" && !Array.isArray(parches)) ? parches : {}
  ));
}

// Une usuarios del JSON (con sus parches) + usuarios registrados localmente
async function obtenerTodosLosUsuarios() {
  const json = await cargarUsuariosJSON();
  const locales = obtenerUsuariosLocales();
  const parches = obtenerParches();

  const jsonConParches = json.map(usuario => {
    const parche = parches[String(usuario.id)];
    return parche ? { ...usuario, ...parche } : usuario;
  });

  return [...jsonConParches, ...locales];
}

function generarIdUnico(usuarios) {
  let id = Date.now();

  while (usuarios.some(u => String(u.id) === String(id))) {
    id++;
  }

  return id;
}

// ============================================================
// 4. SESIÓN
// ============================================================

function obtenerSesion() {
  const raw = sessionStorage.getItem(CLAVE_SESION);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function guardarSesion(usuario) {
  const sesion = {
    id: usuario.id,
    nombre: usuario.nombre || usuario.usuario || "Usuario",
    usuario: usuario.usuario || "",
    email: usuario.email || "",
    rol: usuario.rol || "user",
    avatar: usuario.avatar || "../img/usuario-sin-foto.jpg"
  };

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  sessionStorage.setItem(CLAVE_AUTOSAVE, sesion.nombre);

  return sesion;
}

function cerrarSesion(event) {
  if (event) event.preventDefault();

  sessionStorage.removeItem(CLAVE_SESION);
  sessionStorage.removeItem(CLAVE_AUTOSAVE);

  window.location.href = "index_notLogged.html";
}

// ============================================================
// 5. OBTENER USUARIO COMPLETO (para perfil / navbar / playlists)
// ============================================================

async function obtenerUsuarioCompleto() {
  const sesion = obtenerSesion();
  if (!sesion) return null;

  const idSesion = String(sesion.id);

  // Si es un usuario registrado en el navegador, localStorage es la fuente principal.
  const locales = obtenerUsuariosLocales();
  const local = locales.find(u => String(u.id) === idSesion);

  if (local) {
    return { ...local };
  }

  // Si es un usuario semilla de users.json, se le aplican parches guardados.
  const json = await cargarUsuariosJSON();
  const base = json.find(u => String(u.id) === idSesion) || sesion;

  const parches = obtenerParches();
  const parche = parches[idSesion] || {};

  return { ...base, ...parche };
}

// ============================================================
// 6. GUARDAR CAMBIOS DE PERFIL
// ============================================================

async function guardarPerfilUsuario(cambios = {}) {
  const sesion = obtenerSesion();
  if (!sesion) {
    return { ok: false, mensaje: "Debes iniciar sesión para editar tu perfil." };
  }

  const idSesion = String(sesion.id);
  const limpios = {};

  if (typeof cambios.nombre === "string") {
    const nombre = cambios.nombre.trim();

    if (nombre.length < 3) {
      return { ok: false, mensaje: "El nombre debe tener al menos 3 caracteres." };
    }

    limpios.nombre = nombre;
  }

  if (typeof cambios.usuario === "string") {
    const usuario = cambios.usuario.trim();

    if (!usuario) {
      return { ok: false, mensaje: "El nombre de usuario no puede estar vacío." };
    }

    const todos = await obtenerTodosLosUsuarios();
    const repetido = todos.some(u =>
      String(u.id) !== idSesion &&
      String(u.usuario || "").toLowerCase() === usuario.toLowerCase()
    );

    if (repetido) {
      return { ok: false, mensaje: "Ese nombre de usuario ya está en uso." };
    }

    limpios.usuario = usuario;
  }

  if (typeof cambios.sobreMi === "string") {
    const sobreMi = cambios.sobreMi.trim();

    if (sobreMi.length < 10) {
      return { ok: false, mensaje: 'La sección "Sobre mí" debe tener al menos 10 caracteres.' };
    }

    limpios.sobreMi = sobreMi;
  }

  if (cambios.avatar) {
    limpios.avatar = cambios.avatar;
  }

  if (Object.keys(limpios).length === 0) {
    return { ok: false, mensaje: "No hay cambios para guardar." };
  }

  const locales = obtenerUsuariosLocales();
  const indiceLocal = locales.findIndex(u => String(u.id) === idSesion);

  if (indiceLocal >= 0) {
    // Usuario registrado en este navegador
    locales[indiceLocal] = { ...locales[indiceLocal], ...limpios };
    guardarUsuariosLocales(locales);

    // Eliminar parche viejo para que no pise los datos locales
    const parches = obtenerParches();
    if (parches[idSesion]) {
      delete parches[idSesion];
      guardarParches(parches);
    }
  } else {
    // Usuario de users.json: se guarda un parche encima
    const parches = obtenerParches();
    parches[idSesion] = { ...(parches[idSesion] || {}), ...limpios };
    guardarParches(parches);
  }

  // Actualizar sesión y navbar
  if (limpios.nombre) {
    sesion.nombre = limpios.nombre;
    sessionStorage.setItem(CLAVE_AUTOSAVE, limpios.nombre);
  }

  if (limpios.usuario) sesion.usuario = limpios.usuario;
  if (limpios.email) sesion.email = limpios.email;
  if (limpios.avatar) sesion.avatar = limpios.avatar;

  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  actualizarNavbar();

  const usuario = await obtenerUsuarioCompleto();
  return { ok: true, usuario };
}

// ============================================================
// 7. PLAYLISTS
// ============================================================

async function guardarPlaylistsUsuario(playlists) {
  const sesion = obtenerSesion();
  if (!sesion || !Array.isArray(playlists)) return false;

  const idSesion = String(sesion.id);
  const locales = obtenerUsuariosLocales();
  const indiceLocal = locales.findIndex(u => String(u.id) === idSesion);

  if (indiceLocal >= 0) {
    locales[indiceLocal] = { ...locales[indiceLocal], playlists };
    guardarUsuariosLocales(locales);

    const parches = obtenerParches();
    if (parches[idSesion]) {
      delete parches[idSesion];
      guardarParches(parches);
    }
  } else {
    const parches = obtenerParches();
    parches[idSesion] = { ...(parches[idSesion] || {}), playlists };
    guardarParches(parches);
  }

  return true;
}

// ============================================================
// 8. REGISTRO
// ============================================================

const contraseña = document.getElementById("contraseña");
const Confcontraseña = document.getElementById("contraseñaC");
const alerta = document.getElementById("alerta");
const botonE = document.getElementById("Registro");

if (Confcontraseña && contraseña) {
  Confcontraseña.addEventListener("input", function () {
    if (contraseña.value !== Confcontraseña.value) {
      if (alerta) alerta.textContent = "Las contraseñas no coinciden";
      if (botonE) botonE.disabled = true;
    } else {
      if (alerta) alerta.textContent = "";
      if (botonE) botonE.disabled = false;
    }
  });
}

// ============================================================
// 9. LOGIN
// ============================================================

async function mostrarAlertalogin(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password")
    || document.querySelector('#login input[type="password"]')
    || document.querySelector('input[type="password"]');

  if (!emailInput || !passInput) {
    alert("No se encontraron los campos del formulario.");
    return;
  }

  const identificador = normalizarEmail(emailInput.value);
  const password = passInput.value;

  if (!identificador || !password) {
    alert("Completa el correo/usuario y la contraseña.");
    return;
  }

  const usuarios = await obtenerTodosLosUsuarios();

  const usuario = usuarios.find(u =>
    (u.email && normalizarEmail(u.email) === identificador) ||
    (u.usuario && u.usuario.toLowerCase() === identificador)
  );

  if (!usuario) {
    alert("No existe una cuenta con ese correo o usuario.");
    return;
  }

  if (usuario.password !== password) {
    alert("Contraseña incorrecta.");
    return;
  }

  guardarSesion(usuario);

  const toastHTML = document.getElementById("alertaExitologin");
  if (toastHTML) new bootstrap.Toast(toastHTML).show();

  setTimeout(() => {
    window.location.href = "Index_logged.html";
  }, 1200);
}

// ============================================================
// 10. REGISTRO
// ============================================================

async function mostrarAlertaregister(event) {
  if (event) event.preventDefault();

  const nombre = document.getElementById("nombre")?.value.trim();
  const usuario = document.getElementById("user")?.value.trim();
  const email = normalizarEmail(document.getElementById("email")?.value);
  const telefono = document.getElementById("telefono")?.value.trim() || "";
  const pass = document.getElementById("contraseña")?.value;
  const passC = document.getElementById("contraseñaC")?.value;

  if (!nombre || !usuario || !email || !pass || !passC) {
    alert("Faltan campos obligatorios.");
    return;
  }

  if (nombre.length < 3) {
    alert("El nombre debe tener al menos 3 caracteres.");
    return;
  }

  if (usuario.length < 3) {
    alert("El nombre de usuario debe tener al menos 3 caracteres.");
    return;
  }

  if (!emailValido(email)) {
    alert("El correo no tiene un formato válido.");
    return;
  }

  if (pass.length < 8) {
    alert("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  if (pass !== passC) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  const todos = await obtenerTodosLosUsuarios();

  const correoRepetido = todos.some(u =>
    normalizarEmail(u.email) === email
  );

  if (correoRepetido) {
    alert("Ese correo ya está registrado. Inicia sesión o usa otro correo.");
    return;
  }

  const usuarioRepetido = todos.some(u =>
    String(u.usuario || "").toLowerCase() === usuario.toLowerCase()
  );

  if (usuarioRepetido) {
    alert("Ese nombre de usuario ya está en uso. Elige otro.");
    return;
  }

  const nuevoUsuario = {
    id: generarIdUnico(todos),
    nombre: nombre,
    usuario: usuario,
    email: email,
    telefono: telefono,
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
  };

  const locales = obtenerUsuariosLocales();
  locales.push(nuevoUsuario);
  guardarUsuariosLocales(locales);

  guardarSesion(nuevoUsuario);

  const toastHTML = document.getElementById("alertaExitoregister");
  if (toastHTML) new bootstrap.Toast(toastHTML).show();

  setTimeout(() => {
    window.location.href = "Index_logged.html";
  }, 1200);
}

// ============================================================
// 11. REPRODUCTOR DE AUDIO
// ============================================================

let currentAudio = null;
let currentButton = null;
let currentAudioSrc = null;

const playButtons = document.querySelectorAll(".play-btn");

playButtons.forEach(button => {
  button.addEventListener("click", () => manejarReproduccion(button));
});

async function manejarReproduccion(button) {
  const audioSrc = button.getAttribute("data-audio");
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
        .forEach(b => { b.textContent = "Probar"; });
    }
  }

  const audio = new Audio(audioSrc);
  audio.volume = 0.2;

  currentAudio = audio;
  currentAudioSrc = audioSrc;
  currentButton = button;

  audio.addEventListener("play", () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = "Pausar"; });
  });

  audio.addEventListener("pause", () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = "Probar"; });
  });

  audio.addEventListener("ended", () => {
    document.querySelectorAll(`[data-audio="${CSS.escape(audioSrc)}"]`)
      .forEach(b => { b.textContent = "Probar"; });

    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
      currentAudioSrc = null;
    }
  });

  try {
    await audio.play();
  } catch (err) {
    console.error("Playback failed:", err);

    if (currentAudio === audio) {
      currentAudio = null;
      currentButton = null;
      currentAudioSrc = null;
    }
  }
}

// ============================================================
// 12. AUTOCOMPLETADO DEL REGISTRO
// ============================================================

let user = document.getElementById("user");

if (user != null) {
  if (sessionStorage.getItem(CLAVE_AUTOSAVE)) {
    user.value = sessionStorage.getItem(CLAVE_AUTOSAVE);
  }

  user.addEventListener("change", () => {
    sessionStorage.setItem(CLAVE_AUTOSAVE, user.value);
  });
}

// ============================================================
// 13. NAVBAR DINÁMICA
// ============================================================

function actualizarNavbar() {
  const sesion = obtenerSesion();
  const haySesion = !!sesion;

  const itemLogin = document.getElementById("navItemLogin");
  const itemRegister = document.getElementById("navItemRegister");
  const itemLogout = document.getElementById("navItemLogout");
  const logo = document.querySelector(".navbar-brand");
  const userName = document.getElementById("userName");

  if (haySesion) {
    if (itemLogin) itemLogin.classList.add("d-none");
    if (itemRegister) itemRegister.classList.add("d-none");
    if (itemLogout) itemLogout.classList.remove("d-none");

    if (logo) logo.href = "Index_logged.html";
    if (userName) userName.textContent = sesion.nombre || sesion.usuario || "Perfil";
  } else {
    if (itemLogin) itemLogin.classList.remove("d-none");
    if (itemRegister) itemRegister.classList.remove("d-none");
    if (itemLogout) itemLogout.classList.add("d-none");

    if (logo) logo.href = "index_notLogged.html";
    if (userName) userName.textContent = "Perfil";
  }
}

// ============================================================
// 14. PINTAR PERFIL
// ============================================================

let usuarioActual = null;

function pintarLista(idContenedor, items) {
  const ul = document.getElementById(idContenedor);
  if (!ul) return;

  if (!Array.isArray(items) || items.length === 0) {
    ul.innerHTML = '<li class="mb-2 text-muted">Sin datos</li>';
    return;
  }

  ul.innerHTML = items
    .map(txt => `<li class="mb-2">${escaparHTML(txt)}</li>`)
    .join("");
}

function pintarPerfil(usuario) {
  usuarioActual = usuario;

  const nombreEl  = document.getElementById("nombre_perfil");
  const apodoEl   = document.getElementById("apodo_perfil");
  const fotoEl    = document.getElementById("imagen_perfil_visual");
  const sobreMiEl = document.getElementById("sobre_mi_visual");
  const statPl    = document.getElementById("stat_playlists");
  const statSeg   = document.getElementById("stat_seguidores");
  const statSig   = document.getElementById("stat_seguidos");

  if (!usuario) {
    if (nombreEl) nombreEl.textContent = "Usuario Invitado";
    if (apodoEl) apodoEl.textContent = "@usuario_invitado";
    if (statPl) statPl.textContent = "0";
    if (statSeg) statSeg.textContent = "0";
    if (statSig) statSig.textContent = "0";

    pintarLista("lista_generos", []);
    pintarLista("lista_artistas", []);
    pintarLista("lista_escuchadas", []);
    pintarLista("lista_playlists", []);

    return;
  }

  if (nombreEl) nombreEl.textContent = usuario.nombre || usuario.usuario || "Usuario";
  if (apodoEl) apodoEl.textContent = "@" + (usuario.usuario || "").toLowerCase();

  if (fotoEl && usuario.avatar) fotoEl.src = usuario.avatar;

  if (sobreMiEl) {
    sobreMiEl.textContent = usuario.sobreMi
      || "¡Hola! Soy un amante de la música que siempre está en busca de nuevos ritmos.";
  }

  const playlists = usuario.playlists || [];

  if (statPl) statPl.textContent = playlists.length;
  if (statSeg) statSeg.textContent = usuario.seguidores || 0;
  if (statSig) statSig.textContent = usuario.seguidos || 0;

  pintarLista("lista_generos", usuario.generos || []);
  pintarLista("lista_artistas", usuario.artistas_favoritos || []);
  pintarLista("lista_escuchadas", usuario.mas_escuchadas || []);

  const nombresPlaylists = playlists.map(p =>
    typeof p === "string" ? p : (p.nombre || "Playlist")
  );

  pintarLista("lista_playlists", nombresPlaylists);
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!document.getElementById("nombre_perfil")) return;

  const usuario = await obtenerUsuarioCompleto();
  pintarPerfil(usuario);
});

// ============================================================
// 15. BUSCADOR DE LA NAVBAR
// ============================================================

let datosCatalogo = [];

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("buscador");
  const contenedor = document.getElementById("resultadosBusqueda");

  if (!input || !contenedor) return;

  fetch(RUTA_JSON)
    .then(res => {
      if (!res.ok) throw new Error("JSON no disponible");
      return res.json();
    })
    .then(data => {
      datosCatalogo = Array.isArray(data) ? data : (data.canciones || []);
      console.log(`[Buscador] ${datosCatalogo.length} canciones cargadas.`);
    })
    .catch(err => {
      console.warn("[Buscador] JSON no disponible:", err.message);
    });

  function mostrarResultados(html) {
    contenedor.innerHTML = html;
    contenedor.style.display = "block";
  }

  function ocultarResultados() {
    contenedor.innerHTML = "";
    contenedor.style.display = "none";
  }

  input.addEventListener("input", () => {
    const termino = input.value.toLowerCase().trim();

    if (termino === "") {
      ocultarResultados();
      return;
    }

    if (datosCatalogo.length === 0) {
      mostrarResultados('<div class="list-group-item text-muted">El catálogo aún no está disponible.</div>');
      return;
    }

    const resultados = datosCatalogo.filter(c =>
      (c.titulo || "").toLowerCase().includes(termino) ||
      (c.artista || "").toLowerCase().includes(termino) ||
      (c.genero || "").toLowerCase().includes(termino)
    );

    if (resultados.length === 0) {
      mostrarResultados('<div class="list-group-item text-muted">Sin resultados.</div>');
      return;
    }

    const html = resultados.slice(0, 8).map(c => `
      <div class="list-group-item d-flex align-items-center gap-2">
        ${c.imagen ? `<img src="${c.imagen}" alt="" style="width:36px;height:36px;object-fit:cover;" class="rounded">` : ""}
        <div class="flex-grow-1">
          <strong>${escaparHTML(c.titulo || "Sin título")}</strong><br>
          <small class="text-muted">${escaparHTML(c.artista || "")}${c.genero ? " · " + escaparHTML(c.genero) : ""}</small>
        </div>
        <button
          class="btn btn-sm btn-outline-primary play-btn-busqueda"
          data-audio="${c.audio || ""}">
          ${(currentAudio && currentAudioSrc === c.audio && !currentAudio.paused) ? "Pausar" : "Probar"}
        </button>
      </div>
    `).join("");

    mostrarResultados(html);

    contenedor.querySelectorAll(".play-btn-busqueda").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        manejarReproduccion(btn);
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !contenedor.contains(e.target)) {
      ocultarResultados();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") ocultarResultados();
  });
});

// ============================================================
// 16. PARCHE PARA perfilApp()
// La página perfil.html define perfilApp() en un script inline
// que guardaba en sessionStorage. Como funciones.js se carga
// después, envolvemos esa función para que use la capa central.
// ============================================================

if (typeof window.perfilApp === "function" && !window.__perfilAppParcheado) {
  const perfilAppOriginal = window.perfilApp;

  window.perfilApp = function () {
    const data = perfilAppOriginal();

    // Añadir el campo usuario al formulario
    if (!data.form) data.form = {};
    if (typeof data.form.usuario !== "string") data.form.usuario = "";

    // Rellenar también el @usuario al abrir el modal
    const rellenarOriginal = data.rellenarFormulario;

    data.rellenarFormulario = function () {
      if (typeof rellenarOriginal === "function") {
        rellenarOriginal.call(this);
      }

      if (this.usuario) {
        this.form.usuario = this.usuario.usuario || "";
      }
    };

    // Reemplazar guardarCambios por la versión persistente
    data.guardarCambios = async function () {
      this.errorForm = "";
      this.exitoForm = "";

      const nombreLimpio = (this.form.nombre || "").trim();
      const usuarioLimpio = (this.form.usuario || "").trim();
      const bioLimpia = (this.form.sobreMi || "").trim();

      if (!nombreLimpio || !bioLimpia) {
        this.errorForm = 'Error: El nombre y la descripción "Sobre mí" son obligatorios.';
        return;
      }

      if (nombreLimpio.length < 3) {
        this.errorForm = "Error: El nombre debe tener al menos 3 caracteres.";
        return;
      }

      if (bioLimpia.length < 10) {
        this.errorForm = 'Error: La sección "Sobre mí" debe tener al menos 10 caracteres.';
        return;
      }

      const resultado = await guardarPerfilUsuario({
        nombre: nombreLimpio,
        usuario: usuarioLimpio,
        sobreMi: bioLimpia,
        avatar: this.form.nuevaFotoBase64 || undefined
      });

      if (!resultado.ok) {
        this.errorForm = "Error: " + resultado.mensaje;
        return;
      }

      this.usuario = resultado.usuario;
      this.form.nuevaFotoBase64 = null;

      pintarPerfil(this.usuario);

      this.exitoForm = "¡Perfil actualizado correctamente! Los cambios quedaron guardados.";
    };

    return data;
  };

  window.__perfilAppParcheado = true;
}

// ============================================================
// 17. INICIALIZACIÓN
// ============================================================

document.addEventListener("DOMContentLoaded", actualizarNavbar);