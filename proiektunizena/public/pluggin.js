dataAll = new Array();
document.addEventListener("keyup", (event) => {
  if (event.key == "Ctrl") {
    console.log("Hemendik aurrera datuak gordeko dira");
  }

  let datenow = new Date(Date.now());
  dataAll.push(
    "Start" +
      ":" +
      document.title +
      ";" +
      window.location.hostname +
      ";" +
      datenow,
    "\n"
  );

  document.addEventListener("click", (event) => {
    let datenow = new Date(Date.now());
    dataAll.push("Click" + event.target + ";" + datenow, "\n");
  });

  document.addEventListener("keyup", (event) => {
    let datenow = new Date(Date.now());
    dataAll.push(
      "KeyUp" + event.target + ";" + event.key + ";" + datenow,
      "\n"
    );
    if (event.key == "F8") {
      console.log("F8 sakatuta");
      dataAll.push("Finish" + ";" + Date.now());
      download();
    }
  });

});

  function download() {
    const link = document.createElement("a");
    content = "froga";
    const file = new Blob([dataAll.toString()], { type: "text/plain" });
    link.href = URL.createObjectURL(file);
    link.download = "adibidea.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

