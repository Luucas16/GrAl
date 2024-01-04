
dataAll = new Array();
localStorage.setItem("state", "notCapturing");

// if (state.capturing) {
//   console.log("capturing");

  window.onload = (function () {
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

    dataAll.push("pageLoad" + ";" + window.location.href + ";" + Date.now());
    //alert(dataAll.toString());
  })();

  document.addEventListener("click", (event) => {
    dataAll.push("Click" + event.target + Date.now() + "\n");
  });

  document.addEventListener("keyup", (event) => {
    dataAll.push("KeyUp" + event.key + ";" + Date.now() + "\n");
    if (event.key == "F8") {
      console.log("F8 sakatuta");
      dataAll.push("NotFinish" + ";" + Date.now());
      download();
    }
  });
// }

function download() {
  const link = document.createElement("a");
  content = "froga";
  const file = new Blob([dataAll.toString()], { type: "text/plain" });
  link.href = URL.createObjectURL(file);
  link.download = "adibidea.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}
