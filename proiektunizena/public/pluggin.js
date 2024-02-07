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
        izena = data.izena;

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
                " " +
                izena +
                " " +
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
            //redirigir a otra url
            window.location.replace("https://docs.google.com/forms/d/e/1FAIpQLSdlhLhv2jgXX4wAW6nGNuHRZEI5_R9JZ2H8zXhFZlQVYFrWNA/viewform?usp=sf_link");
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

  var clickedElement = event.target;
  if (clickedElement === null) {
    clickedElement = encontrarElementoMasCercanoSiNecesario(event);

    return;
  }
  if (clickedElement.textContent.length < 40) {
    clickedElementText = clickedElement.textContent;
  }else if(clickedElement.tagName !== ""){
    clickedElementText = clickedElement.tagName;

  }else if(clickedElement.name !== ""){
    clickedElementText = clickedElement.name;
  }else{
    clickedElementText = clickedElement.id;
  } 

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
          clickedElementText +
          " " + //Desplegablea bada dena imprimatzen du, hau begiratu behar da
          moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
          "\n"
      );
    } else {
      gertuna_dagoena = encontrarElementoMasCercano(clickedElement);

      if (gertuna_dagoena.textContent.length < 40) {
      gertuna_dagoenaText = gertuna_dagoena.textContent;
      }else if(gertuna_dagoena.tagName !== ""){
        gertuna_dagoenaText = gertuna_dagoena.tagName;
    
      }else if(gertuna_dagoena.name !== ""){
        gertuna_dagoenaText = gertuna_dagoena.name;
      }else{
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

function encontrarElementoMasCercano(elementoClicado) {

  // Encontrar el elemento más cercano que sea un botón o contenga un enlace
  var elementoConEnlaceCercano = elementoClicado.closest('button, [href], [data-clickable]');
  if (elementoConEnlaceCercano === null) {
    // Si no hay elemento más cercano, buscar el elemento más cercano que contenga un enlace
    elementoConEnlaceCercano = elementoClicado.closest('[href], [data-clickable]');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('button');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('[data-clickable]');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('[href]');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('a');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('input');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('select');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('textarea');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('label');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('span');
  }
  if
  (elementoConEnlaceCercano === null) {
    elementoConEnlaceCercano = elementoClicado.closest('div');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('ul');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('li');
  }
  if(elementoConEnlaceCercano === null){
    elementoConEnlaceCercano = elementoClicado.closest('form');
  }
  


  // Devolver el elemento encontrado (o null si no se encontró ninguno)
  return elementoConEnlaceCercano;
}

function esElementoInteractivo(element) {
  return (
    element !== null &&
    (element instanceof HTMLButtonElement ||
      (element instanceof HTMLAnchorElement && element.href) ||
      (element instanceof HTMLInputElement && (element.type === 'button' || element.type === 'submit')))
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
