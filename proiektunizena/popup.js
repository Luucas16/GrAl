var state = { state: "notcapturing" };
var klikak = false;
var teklak = false;

setInterval(function () {
  fetch("http://localhost:3000/getState", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Network response was not ok: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      state = data.state;
      
      console.log("State changed:", state.state);
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
  if (state === "notcapturing") {
    document.getElementById("estado").innerHTML = "Ez da informaziorik gordeko";
  } else if (state === "capturing") {
    document.getElementById("estado").innerHTML = "Informazioa gordetzen";
  }
}, 500);

document.addEventListener("DOMContentLoaded", function () {
  // Obtener referencia al botón por su ID
  var boton = document.getElementById("miBoton");
  var boton2 = document.getElementById("miBoton2");

  // Agregar un evento clic al botón
  boton.addEventListener("click", function () {
    // var checkb1 = document.getElementById("opcion1");
    // var checkb2 = document.getElementById("opcion2");

    // if (checkb1.checked) {
    //   klikak = true;
    // }
    // if (checkb2.checked) {
    //   teklak = true;
    // }

    // Realizar el fetch al hacer clic en el botón
    fetch("http://localhost:3000/changeState", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "capturing"}),//, klikak, teklak }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error en la solicitud: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Manejar la respuesta del servidor aquí
        console.log("Respuesta del servidor:", data);
      })
      .catch((error) => {
        console.error("Error durante el fetch:", error);
      });
  });

  boton2.addEventListener("click", function () {
    fetch("http://localhost:3000/changeState", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: "notcapturing" }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error en la solicitud: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Manejar la respuesta del servidor aquí
        console.log("Respuesta del servidor:", data);
      })
      .catch((error) => {
        console.error("Error durante el fetch:", error);
      });
  });
});
