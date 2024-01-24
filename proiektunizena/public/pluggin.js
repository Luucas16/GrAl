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
        klikak = data.klikak;
        teklak = data.teklak;

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
          if (klikak === true) {
            document.addEventListener("click", handleClick);
          } else {
            document.removeEventListener("click", handleClick);
          }
          if (teklak === true) {
            document.addEventListener("keyup", handleKeyUp);
          } else {
            document.removeEventListener("keyup", handleKeyUp);
          }
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
        "Egindako klika: " +
          " " +
          clickedElement +
          " " +
          "X:" +
          " " +
          x +
          " " +
          "Y:" +
          " " +
          y +
          " " +
          "Elementuaren izena:" +
          " " +
          clickedElement.textContent +
          " " + //Desplegablea bada dena imprimatzen du, hau begiratu behar da
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
        "Egindako klika: " +
          " " +
          clickedElement +
          " " +
          "X:" +
          " " +
          x +
          " " +
          "Y:" +
          " " +
          y +
          " " +
          "Elementuaren izena:" +
          " " +
          clickedElement.textContent + //Desplegablea bada dena imprimatzen du, hau begiratu behar da
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
  var distanciaMinima = Number.MAX_VALUE;
  var elementoMasCercano = null;

  // Iterar sobre todos los elementos de la página
  var elementos = document.querySelectorAll("*");
  elementos.forEach(function (currentElement) {
    // Obtener las coordenadas del centro del elemento
    var rect = currentElement.getBoundingClientRect();
    var centroX = rect.left + rect.width / 2;
    var centroY = rect.top + rect.height / 2;

    // Calcular la distancia entre el punto (x, y) y el centro del elemento
    var distancia = Math.sqrt(
      Math.pow(centroX - x, 2) + Math.pow(centroY - y, 2)
    );

    // Verificar si esta distancia es menor que la distancia mínima actual
    if (distancia < distanciaMinima && esElementoInteractivo(currentElement)) {
      distanciaMinima = distancia;
      elementoMasCercano = currentElement;
    }
  });

  // Devolver el elemento encontrado (o null si no se encontró ninguno)
  return elementoMasCercano;
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
