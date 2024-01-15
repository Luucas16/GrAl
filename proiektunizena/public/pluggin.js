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
            )
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
  console.log("Click");
  dataAll.push(
    "Egindako klika: " +
      event.target +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n"
  );
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
