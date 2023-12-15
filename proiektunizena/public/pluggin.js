dataAll = new Array(); //oraingoz datuak horrela gordetzen ditugu. Aurrerago fitxategi batean idatziko dira, eta gero direktamente mongoDBra bidaliko dira

//Hasiera emateko
document.addEventListener("keyup", (event) => {
  if (event.key == "F7") {
    console.log("Hemendik aurrera datuak gordetzen hasiko dira");
    let datenow = new Date(Date.now());
    dataAll.push("Finish" + ";" + datenow);
    download();
  }

  window.load = (function () {
    console.log("loadBegin");
    //LOCALSTORAGE

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

    dataAll.push("pageLoad" + ";" + window.location.href + ";" + datenow, "\n");
    //alert(dataAll.toString());
  })();
  //Klik egin dela gorde (Oraingoz ez dakigu nun egin duen klik, hau implementatzeko)
  document.addEventListener("click", (event) => {
    let datenow = new Date(Date.now());
    dataAll.push("Click" + event.target + ";" + datenow, "\n");
  });
  //Tekla bat sakatzean zein sakatu den jakiteko
  document.addEventListener("keyup", (event) => {
    let datenow = new Date(Date.now());
    dataAll.push(
      "KeyUp" + event.target + ";" + event.key + ";" + datenow,
      "\n"
    );
    //Datuak hartzeaz geldittu eta deskargatu
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
