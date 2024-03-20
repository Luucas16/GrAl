var state = "capturing"; // Inicializa el estado
var preState = "notcapturing";
var nabigazio_librea;
var hasierako_weba;
var dataAll = "";

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
    console.log(state.state === "capturing");
    klikak = data.klikak;
    teklak = data.teklak;
    birbidali = data.birbidali;
    klikop = data.klikop;
    teklakop = data.teklakop;
  });

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
      console.log(data.state !== state);
      // Verifica si el estado ha cambiado desde la última vez
      if (data.state !== state) {
        preState = state;
        state = data.state;
        first = data.lehenengoAldia;
        klikak = data.klikak;
        teklak = data.teklak;
        izena = data.izena;
        birbidali = data.birbidali;
        //dataAll = data.dataAll;
        if (birbidali) {
          birbidali = false;
          fetch("http://localhost:3000/birbidali", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: birbidali,
            }),
          }).then((res) => {
            if (!res.ok) {
              throw new Error(`Network response was not ok: ${res.status}`);
            }
            window.location.replace(
              "https://docs.google.com/forms/d/e/1FAIpQLSdlhLhv2jgXX4wAW6nGNuHRZEI5_R9JZ2H8zXhFZlQVYFrWNA/viewform?usp=sf_link"
            );
            return res.json();
          });

          return;
        }
        console.log("First:   " + first);
        if (
          first &&
          window.location.href !== "http://localhost:3000/login" &&
          state === "notcapturing" &&
          window.location.href.indexOf("https://docs.google.com/forms") !== 0
        ) {
          window.location.href = "http://localhost:3000/login";
        }
        if (data.bukaera_puntua) {
          if (state === "capturing") {
            if (!data.nabigazio_librea) {
              window.location.href = data.hasierako_weba;
            }
          }
        }
      }

      // Verifica si el estado ahora es 'capturing'
      if (data.state === "capturing") {
        console.log(data.nabigazio_librea);

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
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}, 500);

function handleClick(event) {
  var x = event.clientX;
  var y = event.clientY;

  var clickedElement = event.target;
  if (clickedElement === null) {
    clickedElement = encontrarElementoMasCercanoSiNecesario(event);

    return;
  }
  if (clickedElement.textContent.length < 40) {
    clickedElementText = clickedElement.textContent;
  } else if (clickedElement.tagName !== "") {
    clickedElementText = clickedElement.tagName;
  } else if (clickedElement.name !== "") {
    clickedElementText = clickedElement.name;
  } else {
    clickedElementText = clickedElement.id;
  }

  if (esElementoInteractivo(clickedElement)) {
    console.log("Click" + clickedElement + "X:" + x + "Y:" + y);

    dataAll = dataAll.concat(
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
        clickedElementText +
        " " + //Desplegablea bada dena imprimatzen du, hau begiratu behar da
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n"
    );
  } else {
    gertuna_dagoena = encontrarElementoMasCercano(clickedElement);

    if (gertuna_dagoena.textContent.length < 40) {
      gertuna_dagoenaText = gertuna_dagoena.textContent;
    } else if (gertuna_dagoena.tagName !== "") {
      gertuna_dagoenaText = gertuna_dagoena.tagName;
    } else if (gertuna_dagoena.name !== "") {
      gertuna_dagoenaText = gertuna_dagoena.name;
    } else {
      gertuna_dagoenaText = gertuna_dagoena.id;
    }

    console.log(
      "Click" +
        "X:" +
        x +
        "Y:" +
        y +
        "Elementu gertuena:" +
        " " +
        gertuna_dagoenaText
    );
    dataAll = dataAll.concat(
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
        clickedElementText +
        " " +
        "Elementu gertuena:" +
        " " +
        gertuna_dagoenaText +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n"
    );
  }
  klikop = klikop + 1;
  fetch("http://localhost:3000/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: dataAll,
      klikop: klikop,
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.status}`);
    }
    dataAll = "";
    return res.json();
  });
}

function handleKeyUp(event) {
  console.log("KeyUp");
  dataAll = dataAll.concat(
    "Sakatutako Tekla: " +
      " " +
      event.key +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n"
  );
  teklakop = teklakop + 1;
  fetch("http://localhost:3000/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: dataAll,
      teklakop: teklakop,
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`Network response was not ok: ${res.status}`);
    }
    dataAll = "";
    return res.json();
  });
}

function encontrarElementoMasCercano(elementoClicado) {
  // Encontrar el elemento más cercano que sea un botón o contenga un enlace
  var elementoConEnlaceCercano = elementoClicado.closest(
    "button, [href], [data-clickable]"
  );
  if (elementoConEnlaceCercano === null) {
    // Si no hay elemento más cercano, buscar el elemento más cercano que contenga un enlace
    elementoConEnlaceCercano = elementoClicado.closest(
      "[href], [data-clickable]"
    );
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("button");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("[data-clickable]");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("[href]");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("a");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("input");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("select");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("textarea");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("label");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("span");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("div");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("ul");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("li");
  }
  if (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest("form");
  }

  // Devolver el elemento encontrado (o null si no se encontró ninguno)
  return elementoConEnlaceCercano;
}

function esElementoInteractivo(element) {
  return (
    element !== null &&
    (element instanceof HTMLButtonElement ||
      (element instanceof HTMLAnchorElement && element.href) ||
      (element instanceof HTMLInputElement &&
        (element.type === "button" || element.type === "submit")))
  );
}

function encontrarElementoMasCercanoSiNecesario(event) {
  var x = event.clientX;
  var y = event.clientY;

  // Intenta obtener el elemento directamente desde las coordenadas del clic
  var clickedElement = document.elementFromPoint(x, y);

  // Si no se encuentra ningún elemento directamente en las coordenadas, encuentra el elemento más cercano usando closest
  if (!clickedElement) {
    return encontrarElementoMasCercano(document.elementFromPoint(x - 1, y - 1));
  }

  return clickedElement;
}
