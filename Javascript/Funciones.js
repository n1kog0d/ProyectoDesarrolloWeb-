// Register
const contraseña = document.getElementById("contraseña");
const Confcontraseña = document.getElementById("contraseñaC");
const alerta = document.getElementById("alerta");
const botonE = document.getElementById("Registro");
Confcontraseña.addEventListener("input", function() {
  if (contraseña.value != contraseñaC.value){
    alerta.textContent = "Las contraseñas no coinciden";
    botonE.disabled = true;  
  }
  else {
    alerta.textContent = "";
    botonE.disabled = false;  
  }
});
