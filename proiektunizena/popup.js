// import { state } from "./public/utils,js";
document.addEventListener("DOMContentLoaded", function () {
  var dropdown = document.getElementById("dropdown");
  var boton = document.getElementById("miBoton");

  boton.addEventListener("click", function () {
    var selectedOption = dropdown.options[dropdown.selectedIndex].value;
    if (selectedOption == "Captura") {
    state.capturing = true;
    }
  });
});
