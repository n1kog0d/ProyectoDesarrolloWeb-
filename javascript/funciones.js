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
  button.addEventListener('click', async () => {
    const audioSrc = button.getAttribute('data-audio');

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

//Cargar datos al perfil f5
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

