// Register
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
        currentButton.textContent = 'Escuchar';
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
      button.textContent = 'Escuchar';
    });

    audio.addEventListener('ended', () => {
      button.textContent = 'Escuchar';
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

//redirect inicio de sesion
function mostrarAlertalogin(event) {
    event.preventDefault();
    const toastHTML = document.getElementById('alertaExitologin');
    const toast = new bootstrap.Toast(toastHTML);
    toast.show();
    setTimeout(function() {  
        window.location.href = 'index.html'; 
    }, 2000); 
  }
//redirect registro de cuenta
  function mostrarAlertaregister(event) {
    event.preventDefault();
    const toastHTML = document.getElementById('alertaExitoregister');
    const toast = new bootstrap.Toast(toastHTML);
    toast.show();
    setTimeout(function() {  
        window.location.href = 'index.html'; 
    }, 2000); 
  }