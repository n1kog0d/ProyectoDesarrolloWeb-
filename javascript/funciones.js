// registro de cuenta
const contraseña = document.getElementById("contraseña");
const Confcontraseña = document.getElementById("contraseñaC");
const alerta = document.getElementById("alerta");
const botonE = document.getElementById("Registro");

if (Confcontraseña && contraseña) {
  Confcontraseña.addEventListener("input", function() {
    if (contraseña.value !== Confcontraseña.value) {
      alerta.textContent = "Las contraseñas no coinciden";
      botonE.disabled = true;  
    } else {
      alerta.textContent = "";
      botonE.disabled = false;  
    }
  });
}
//Audio
let currentAudio = null;
let currentButton = null;

const playButtons = document.querySelectorAll('.play-btn');
playButtons.forEach(button => {
  button.addEventListener('click', () => manejarReproduccion(button));
});

    if (currentAudio && currentButton === button) {
      if (currentAudio.paused) {
        await currentAudio.play();
      } else {
        currentAudio.pause();
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      if (currentButton) {
        currentButton.textContent = 'Probar';
      }
    }

    const audio = new Audio(audioSrc);
    audio.volume = 0.2;
    currentAudio = audio;
    currentButton = button;

    audio.addEventListener('play', () => {
      button.textContent = 'Pausar';
    });

    audio.addEventListener('pause', () => {
      button.textContent = 'Probar';
    });

    audio.addEventListener('ended', () => {
      button.textContent = 'Probar';
      if (currentAudio === audio) {
        currentAudio = null;
        currentButton = null;
      }
    });

    try {
      await audio.play();
    } catch (err) {
      console.error("Playback failed. Verify file path and format:", err);
      if (currentAudio === audio) {
        currentAudio = null;
        currentButton = null;
      }
    }
  });
});

//rediregir a inicio de sesion
function mostrarAlertalogin(event) {
    event.preventDefault();
    const toastHTML = document.getElementById('alertaExitologin');
    const toast = new bootstrap.Toast(toastHTML);
    toast.show();
    setTimeout(function() {  
        window.location.href = 'index.html'; 
    }, 2000); 
  }
//rediregir a registro de cuenta
  function mostrarAlertaregister(event) {
    event.preventDefault();
    const toastHTML = document.getElementById('alertaExitoregister');
    const toast = new bootstrap.Toast(toastHTML);
    toast.show();
    setTimeout(function() {  
        window.location.href = 'index.html'; 
    }, 2000); 
  }

  // mantener nombre de usuario en el registro
  // Registro
let user = document.getElementById("user");
if (user != null) {
    if (sessionStorage.getItem("autosave")) {
        user.value = sessionStorage.getItem("autosave");
    }
    user.addEventListener("change", () => {
        sessionStorage.setItem("autosave", user.value);
    });
}

// Cambio en la navbar y perfil
const userName = document.getElementById("userName");
const nombrePerfil = document.getElementById("nombre_perfil");
const apodoPerfil = document.getElementById("apodo_perfil");

let usuarioGuardado = sessionStorage.getItem("autosave");

if(usuarioGuardado != null){
  
  if (userName != null) {
      userName.textContent = usuarioGuardado;

    if(nombrePerfil != null){
        nombrePerfil.textContent = usuarioGuardado;
    } 
    
    if(apodoPerfil != null){
      apodoPerfil.textContent = "@" + usuarioGuardado.toLocaleLowerCase().replace(/\s+/g,'');
    }
}
}
else{
  if (userName != null){
    userName.textContent = "Perfil"
  }
} 

//formulario editar perfil

const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
if (btnGuardarPerfil != null) {
    btnGuardarPerfil.addEventListener("click", function() {
        
        const inputSobreMi = document.getElementById("inputSobreMi").value;
        if (inputSobreMi.trim() !== "") { 
            
            sessionStorage.setItem("perfil_sobreMi", inputSobreMi);
            
            document.getElementById("sobre_mi_visual").textContent = inputSobreMi;
        }
        
        const inputFoto = document.getElementById("inputFoto");
        if (inputFoto.files && inputFoto.files[0]) {
            
            const lector = new FileReader();
            lector.onload = function(evento) {
                
                const imagenBase64 = evento.target.result;
                
                
                sessionStorage.setItem("perfil_foto", imagenBase64);
                
                
                document.getElementById("imagen_perfil_visual").src = imagenBase64;
            };
          
            lector.readAsDataURL(inputFoto.files[0]);
        }
        const modalElement = document.getElementById("modalEditarPerfil");
        const modalInstancia = bootstrap.Modal.getInstance(modalElement);
        modalInstancia.hide();
    });
}

//Cargar datos al perfil
const imagenVisual = document.getElementById("imagen_perfil_visual");
const sobreMiVisual = document.getElementById("sobre_mi_visual");
if (imagenVisual != null) {
  
    if (sessionStorage.getItem("perfil_foto")) {
        imagenVisual.src = sessionStorage.getItem("perfil_foto");
    }
}
if (sobreMiVisual != null) {
   
    if (sessionStorage.getItem("perfil_sobreMi")) {
        sobreMiVisual.textContent = sessionStorage.getItem("perfil_sobreMi");
    }
  }

/* ============================================================
   BUSCADOR DE CANCIONES - Hourtz
   Se conecta a un futuro archivo JSON con el catálogo.
   Reutiliza la lógica de reproducción existente.
   ============================================================ */

let datosCatalogo = [];

// Ajusta la ruta si colocas el JSON en otra ubicación
const RUTA_JSON = '../javascript/datos.json';

document.addEventListener('DOMContentLoaded', () => {

    const input = document.getElementById('buscador');
    const contenedor = document.getElementById('resultadosBusqueda');

    // Si esta página no tiene buscador, no hacemos nada
    if (!input || !contenedor) return;

    // --- Cargar el JSON (cuando exista) ---
    fetch(RUTA_JSON)
        .then(res => {
            if (!res.ok) throw new Error('JSON no disponible');
            return res.json();
        })
        .then(data => {
            datosCatalogo = Array.isArray(data) ? data : (data.canciones || []);
            console.log(`[Buscador] ${datosCatalogo.length} canciones cargadas.`);
        })
        .catch(err => {
            console.warn('[Buscador] El JSON aún no está disponible:', err.message);
        });

    // --- Mostrar/ocultar el contenedor de resultados ---
    function mostrarResultados(html) {
        contenedor.innerHTML = html;
        contenedor.style.display = 'block';
    }
    function ocultarResultados() {
        contenedor.innerHTML = '';
        contenedor.style.display = 'none';
    }

    // --- Evento de escritura ---
    input.addEventListener('input', () => {
        const termino = input.value.toLowerCase().trim();

        if (termino === '') {
            ocultarResultados();
            return;
        }

        if (datosCatalogo.length === 0) {
            mostrarResultados(
                '<div class="list-group-item text-muted">El catálogo aún no está disponible.</div>'
            );
            return;
        }

        // Filtrar por título, artista o género
        const resultados = datosCatalogo.filter(c =>
            (c.titulo  || '').toLowerCase().includes(termino) ||
            (c.artista || '').toLowerCase().includes(termino) ||
            (c.genero  || '').toLowerCase().includes(termino)
        );

        if (resultados.length === 0) {
            mostrarResultados(
                '<div class="list-group-item text-muted">Sin resultados.</div>'
            );
            return;
        }

        // Renderizar (máx. 8 para no saturar el navbar)
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
                    Probar
                </button>
            </div>
        `).join('');

        mostrarResultados(html);

        // Enganchar el reproductor a los botones generados dinámicamente
        contenedor.querySelectorAll('.play-btn-busqueda').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // no cerrar el desplegable al pulsar
                manejarReproduccion(btn);
            });
        });
    });

    // --- Cerrar resultados al hacer clic fuera ---
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !contenedor.contains(e.target)) {
            ocultarResultados();
        }
    });

    // --- Cerrar con ESC ---
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') ocultarResultados();
    });
});


/* ============================================================
   Reproductor reutilizable (misma lógica que tu catálogo)
   Se usa tanto desde el buscador como desde los .play-btn fijos.
   ============================================================ */

async function manejarReproduccion(button) {
    const audioSrc = button.getAttribute('data-audio');
    if (!audioSrc) return;

    // Si es el mismo botón y el mismo audio → play/pause
    if (currentAudio && currentButton === button) {
        if (currentAudio.paused) {
            await currentAudio.play();
        } else {
            currentAudio.pause();
        }
        return;
    }

    // Detener el audio anterior
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentButton) {
            currentButton.textContent = 'Probar';
        }
    }

    const audio = new Audio(audioSrc);
    audio.volume = 0.2;
    currentAudio = audio;
    currentButton = button;

    audio.addEventListener('play',   () => { button.textContent = 'Pausar'; });
    audio.addEventListener('pause',  () => { button.textContent = 'Probar'; });
    audio.addEventListener('ended',  () => {
        button.textContent = 'Probar';
        if (currentAudio === audio) {
            currentAudio = null;
            currentButton = null;
        }
    });

    try {
        await audio.play();
    } catch (err) {
        console.error("Playback failed. Verify file path and format:", err);
        if (currentAudio === audio) {
            currentAudio = null;
            currentButton = null;
        }
    }
}