var state = { state: "notcapturing" }; // Inicializa el estado

var preState = { state: "notcapturing" };

var dataAll = new Array();

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
      console.log(data);
      console.log(state === "capturing");

      // Verifica si el estado ha cambiado desde la última vez
      if (data.state !== state) {
        preState = state;
        state = data.state;
        first = data.lehenengoAldia;
        console.log("Prestate:   " + preState);

        console.log("State changed:", state);

        // Verifica si el estado ahora es 'capturing'
        if (state === "capturing") {
          console.log("capturing");

          if (localStorage.getItem("dataAll") !== null) {
            dataAll = JSON.parse(localStorage.getItem("dataAll"));
          }

          if (localStorage.getItem("first") === null) {
            localStorage.setItem("first", true);
            dataAll.push(
              "Start" +
                ":" +
                document.title +
                ";" +
                window.location.hostname +
                ";" +
                moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
                "\n"
            );
            dataAll.push(
              "Kargatutako URLa:" +
                " " +
                window.location.href +
                " " +
                moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
                "\n"
            );
            localStorage.setItem("dataAll", JSON.stringify(dataAll));
            localStorage.setItem("first", false);
          }

          document.addEventListener("click", handleClick);
          document.addEventListener("keyup", handleKeyUp);
        } else {
          // Si el estado ya no es 'capturing', elimina los oyentes de eventos
          document.removeEventListener("click", handleClick);
          document.removeEventListener("keyup", handleKeyUp);
          if (preState === "capturing") {
            dataAll.push(
              "Finish" +
                ":" +
                " " +
                moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
                "\n"
            );
            localStorage.setItem("dataAll", JSON.stringify(dataAll));
            download();
            localStorage.clear();
            dataAll = new Array();
            return;
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}, 500);

function handleClick(event) {
  var x = event.clientX;
  var y = event.clientY;

  var clickedElement = document.elementFromPoint(x, y);
  if (clickedElement === null) {
    gertuna_dagoena = encontrarElementoMasCercano(x, y);
    console.log("Click" + "X:" + x + "Y:" + y);
    dataAll.push(
      "Inongo elementua ez duen klika egin du" +
        " " +
        "Elementu gertuena:" +
        " " +
        gertuna_dagoena +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n"
    );
  } else {
    if (esElementoInteractivo(clickedElement)) {
      console.log("Click" + clickedElement + "X:" + x + "Y:" + y);
      dataAll.push(
        "Egindako klika: " + " " +
          clickedElement + " " +
          "X:" + " " +
          x + " " +
          "Y:" + " " +
          y + " " +
          "Elementuaren izena:" +
          " " +
          clickedElement.textContent + " " +
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
          "\n"
      );
    } else {
      gertuna_dagoena = encontrarElementoMasCercano(x, y);
      console.log(
        "Click" +
          "X:" +
          x +
          "Y:" +
          y +
          "Elementu gertuena:" +
          " " +
          gertuna_dagoena
      );
      dataAll.push(
        "Egindako klika: " + " " + 
          clickedElement + " " +
          "X:" + " " +
          x + " " + 
          "Y:" + " " +
          y + " " +
          "Elementuaren izena:" +
          " " +
          clickedElement.textContent +
          " " +
          "Elementu gertuena:" +
          " " +
          gertuna_dagoena +
          " " +
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
          "\n"
      );
    }
  }
  localStorage.setItem("dataAll", JSON.stringify(dataAll));
}

function handleKeyUp(event) {
  console.log("KeyUp");
  dataAll.push(
    "Sakatutako Tekla: " +
      " " +
      event.key +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n"
  );
  localStorage.setItem("dataAll", JSON.stringify(dataAll));
}

function download() {
  const datos = JSON.parse(localStorage.getItem("dataAll"));
  const link = document.createElement("a");
  const file = new Blob([datos.toString()], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = window.location.host + ".txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

function encontrarElementoMasCercano(x, y) {
  // Iterar sobre todas las coordenadas de la ventana del navegador
  for (var currentX = 0; currentX < window.innerWidth; currentX++) {
    for (var currentY = 0; currentY < window.innerHeight; currentY++) {
      // Obtener el elemento en las coordenadas actuales
      var currentElement = document.elementFromPoint(currentX, currentY);

      // Verificar si el elemento es interactivo
      if (esElementoInteractivo(currentElement)) {
        // Devolver el elemento encontrado
        return currentElement;
      }
    }
  }

  // Si no se encuentra ningún elemento interactivo en la página, devolver null
  return null;
}

function esElementoInteractivo(element) {
  // Implementa la lógica para determinar si el elemento es interactivo.
  // Puedes personalizar esta función según tus necesidades.
  // Aquí se considera interactivo si el elemento no es nulo y tiene un manejador de clic.
  return (
    element !== null &&
    (typeof element.onclick === "function" ||
      typeof element.click === "function")
  );
}
