// Hemen erabiltzailearen ordenagailuan exekutatzen den kodea dago

/////////////////////////  Aldagien hasieraketa eta ddefinizioa  /////////////////////////
var dataAll = "";
var fetch_link = "http://localhost:3000";
var bukaerako_botoia_class = "";
var nabigazio_librea = false;
var klikop = 0;
var teklakop = 0;
/////////////////////////  Aldagien hasieraketa eta ddefinizioa  /////////////////////////

//Honek eskaera bat egiten du segundu erdiro, ikusteko egoera zein det eta horren arabera datuak gordetzen hasi, gelditu... Etab egiteko
setInterval(function () {
  fetch(fetch_link + "/getState", {
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
      bukaerako_botoia_class = data.bukaerako_botoia_class;
      nabigazio_librea = data.nabigazio_librea;
      klikop = data.klikop;
      teklakop = data.teklakop;

      //hasteko zerbitzariaren aldagaiak lortzen ditugu
      console.log("Birbidali: " + data.birbidali);
      //Birbidali true bada, orduan esan nahi du testa bukatu dela eta formularioa bete behar dela. Hau egiteko Google docs-en formularioa ireki
      if (data.birbidali) {
        data.birbidali = false;
        fetch(fetch_link + "/birbidali", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: data.birbidali,
          }),
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Network response was not ok: ${res.status}`);
          }
          window.location.replace(
            "https://docs.google.com/forms/d/e/1FAIpQLSdlhLhv2jgXX4wAW6nGNuHRZEI5_R9JZ2H8zXhFZlQVYFrWNA/viewform?usp=sf_link" //Formularioaren linka
          );
          return res.json();
        });

        return;
      }
      console.log("birbidali: " + data.birbidali);
      //Honek erabiltzailea pluginaren horrira ematen du, lehenengo aldia bada noski
      if (
        data.lehenengoAldia &&
        window.location.href !== fetch_link + "/login" &&
        window.location.href !== fetch_link + "/popup" &&
        data.state === "notcapturing" &&
        window.location.href.indexOf("https://docs.google.com/forms") !== 0
      ) {
        window.location.href = fetch_link + "/login";
      }
      //Behin egoera capturin dagoela, eta nabigazioa librea ez bada, hasierako webgunea kargatu
      if (
        data.lehenengoAldia &&
        data.state === "capturing" &&
        !data.nabigazio_librea &&
        window.location.href.indexOf(data.hasierako_weba) !== 0 &&
        window.location.href.indexOf("https://docs.google.com/forms") !== 0
      ) {
        window.location.href = data.hasierako_weba;
        data.lehenengoAldia = false;
        fetch(fetch_link + "/first", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: data.lehenengoAldia,
          }),
        });
      }
      // }

      // Capturing egoeran dagoenean, klikak eta teklak baimendu
      if (data.state === "capturing") {
        // Nabigazio librea ez bada eta bukaerako webera iritsi bada, orduan notCapturing egoerara aldatu
        // if (
        //   !data.nabigazio_librea &&
        //   window.location.href === data.bukaera_puntua
        // ) {
        //   fetch(fetch_link + "/changeState", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ state: "notcapturing" }),
        //   }).then((res) => {
        //     if (!res.ok) {
        //       throw new Error(`Network response was not ok: ${res.status}`);
        //     }
        //     return res.json();
        //   });s
        //   return;
        // }

        if (
          data.klikak === true &&
          window.location.href.indexOf("https://docs.google.com/forms") !== 0
        ) {
          document.addEventListener("click", handleClick);
        } else {
          document.removeEventListener("click", handleClick);
        }
        if (
          data.teklak === true &&
          window.location.href.indexOf("https://docs.google.com/forms") !== 0
        ) {
          document.addEventListener("keyup", handleKeyUp);
        } else {
          document.removeEventListener("keyup", handleKeyUp);
        }
      } else {
        // Capturing egoeran ez dagoenean, ezabatu klikak eta teklaken jasotzea
        document.removeEventListener("click", handleClick);
        document.removeEventListener("keyup", handleKeyUp);
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}, 500);

//Honek klikak jasotzen ditu, eta datuak gordetzen ditu, gainera klika ez badu nehi zuen botoian eman, gertuen dagoen elementua bilatzen du. Klik kopurua ere gordetzen du
function handleClick(event) {
  var x = event.clientX;
  var y = event.clientY;

  var clickedElement = event.target;
  if (clickedElement === null) {
    clickedElement = encontrarElementoMasCercanoSiNecesario(event);

    return;
  }
  if (clickedElement.getAttribute("href") != null) {
    //Ikusi ea klik egiten den bukaerako botoian, eta nabigazio librea ez bada, orduan notCapturing egoerara aldatu
    if (
      clickedElement.getAttribute("href") === bukaerako_botoia_class &&
      !nabigazio_librea
    ) {
      event.preventDefault();
      console.log("He llegado aqui");
      fetch(fetch_link + "/changeState", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "notcapturing" }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
      });
      return;
    }
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
  fetch(fetch_link + "/data", {
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
//Honek sakatutako teklak gordetzen ditu, baita tekla kopurua ere
function handleKeyUp(event) {
  console.log("KeyUp");
  if (event.key === "Enter") {
    handleClick(event);
    return;
  }

  dataAll = dataAll.concat(
    "Sakatutako Tekla: " +
      " " +
      event.key +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n"
  );
  teklakop = teklakop + 1;
  fetch(fetch_link + "/data", {
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
//Honek elementu gertuenaren bila egiten du, hau da, elementu bat sakatzen bada, baina ez bada botoi bat, hau egiten du
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
//Klikatutako elementua iteraktiboa den edo ez ikusten du
function esElementoInteractivo(element) {
  return (
    element !== null &&
    (element instanceof HTMLButtonElement ||
      (element instanceof HTMLAnchorElement && element.href) ||
      (element instanceof HTMLInputElement &&
        (element.type === "button" || element.type === "submit")))
  );
}
//Gertuen dagoen elementua bilatzen du
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
