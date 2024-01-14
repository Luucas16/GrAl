dataAll = new Array();

var state = { state: "notcapturing" };
var first = true;

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
      console.log(data.state === 'capturing');

      // Verifica si el estado ha cambiado desde la última vez
      if (data.state !== state.state) {
        state = data;
        console.log("State changed:", state.state);

        // Verifica si el estado ahora es 'capturing'
        if (state.state === 'capturing') {
          console.log("capturing");

          console.log("loadBegin");
          dataAll.push(
            "Start" +
              ":" +
              document.title +
              ";" +
              window.location.hostname +
              ";" +
              Date.now() +
              "\n"
          );
          dataAll.push("Kargatutako URLa:" + " " + window.location.href + " " + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + "\n");
          first = false;

          document.addEventListener("click", handleClick);
          document.addEventListener("keyup", handleKeyUp);
        } else {
          // Si el estado ya no es 'capturing', elimina los oyentes de eventos
          document.removeEventListener("click", handleClick);
          document.removeEventListener("keyup", handleKeyUp);
        }
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
}, 500);

function handleClick(event) {
  console.log("Click");
  dataAll.push("Egindako klika: " + event.target + moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + "\n");
}

function handleKeyUp(event) {
  console.log("KeyUp");
  dataAll.push("Sakatutako Tekla: " + event.key +  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss') + "\n");
  if (event.key == "F8") {
    download();
  }
}

function download() {
  const link = document.createElement("a");
  const file = new Blob([dataAll.toString()], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = "adibidea.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}
