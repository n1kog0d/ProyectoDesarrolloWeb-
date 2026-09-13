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
  button.addEventListener('click', () => {
    const audioSrc = button.getAttribute('data-audio');
    
    if (currentAudio && currentAudio.src.endsWith(audioSrc)) {
      if (currentAudio.paused) {
        currentAudio.play();
        button.textContent = 'Pausar';
      } else {
        currentAudio.pause();
        button.textContent = 'Escuchar';
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

    currentAudio = new Audio(audioSrc);
    currentButton = button;

    currentAudio.play().catch(err => {
      console.error("Playback failed. Verify file path and format:", err);
    });
    
    button.textContent = 'Pausar';

    currentAudio.addEventListener('ended', () => {
      button.textContent = 'Escuchar';
      currentAudio = null;
      currentButton = null;
    });
  });
});