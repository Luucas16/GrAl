// Zerbitzaria (Honek plugina eta Mongoren arteko komunikazioa egiten du)

const fs = require("fs"); //config.json irakurtzeko
var express = require("express"); //Aplkazioaren modulua (honek zerbitzaria sortzen du eta entzuten jartzen da. Eskaerak hartu eta erantzuten ditu)
var app = express();
var bodyParser = require("body-parser"); //Eskaerak prozesatzeko (JSON, URL-encoded, edo plain text)
var cors = require("cors"); // CORS politikak aplikatzeko (Cross-Origin Resource Sharing)
var moment = require("moment"); //Data eta orduak formatu egokian erakusteko
const path = require("path"); // login.html eta popup.html fitxategiak kargatzekoq

//////////////////////////////////////////////////////////////////////// Aldagiak ////////////////////////////////////////////////////////////////////

// login.html eta popup.html kargatzeko direktorio basea
const baseDir = path.join(__dirname, ".."); // __dirname: direktorioa non dagoen (aurreko karpetan daude login.html eta popup.html)

let inicioTiempo = Date.now(); // Hasierako denbora gordeko duen aldagia

// Hasierako datuak irakurri, hau da, konfigurazioa
fs.readFile(__dirname + "/test/conf.json", "utf8", (err, data0) => {
  if (err) {
    console.error(err);
    return;
  }
  // JSON fitxategiaren edukia irakurri
  const jsonObject1 = JSON.parse(data0);
  // JSON fitxategiaren 'testak' aldagaia irakurri
  const innerObject1 = jsonObject1.testak;
  // Dauden test kopurua kontatu
  const numberOfTests = Object.keys(innerObject1).length;
  // console.log(numberOfTests);

  //mongodb
  const mongoose = require("mongoose"); //Mongora konektatzeko
  // MongoDB esquema, hau da, datu-basean gordeko den informazioa nola gordeko den zehazten duen kodea
  const erabiltzaileEskema = new mongoose.Schema({
    erabiltzailea: String,
    testid: Number,
    data: String,
    klikop: Number,
    teklakop: Number,
    dembora_segunduetan: Number,
  });
  const db = mongoose.model("Proba", erabiltzaileEskema); //Modeloa sortu (Proba izeneko datu-basea)
  const DB_URL = "mongodb://127.0.0.1:27017/GrAl"; //MongoDB URL-a
  mongoose
    .connect(DB_URL)
    .then(() => console.log("Conexión exitosa a MongoDB"));

  let datos = {
    state: "notcapturing", //notcapturing edo capturing
    lehenengoAldia: true, // True edo False (Lehenengo aldian sartu den edo ez zehazten du) (Hau plugina lehenengo aldian sartu den ala ez zehazten du)
    klikak: false, //True edo False (Egindako Klikak gorde behar diren edo ez zehazten du)
    teklak: false, //True edo False (Sakatutako Teklak gorde behar diren edo ez zehazten du)
    izena: "", //Erabiltzailearen izena
    dataAll: "", // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko
    hasierako_weba: "", //Nabigazio ez libre bada zein den hasierkao weba
    bukaera_puntua: "", // Nabigazio ez libre bada zein den bukaera puntuaren URL-a
    nabigazio_librea: "", // True edo False (Nabigazio libre bada edo ez zehazten du)
    bukaerako_botoia_class: "", // Nabegazio ez libre bada zein den bukaerako botoiaren propietatea edo beste botoietatik zer den desberdina
    birbidali: false, // True edo False (Hau true bada, orduan galdetegira birbidali erabiltzailea, bestela ez)
    klikop: 0, // Klik kopurua
    teklakop: 0, // Tekla kopurua
    dembora_segunduetan: 0, // Segundu kopurua
    testid: 1, // Testaren identifikadorea
    dembora_max: 0, // Testaren dembora maximoa
    galdetegia: "", // Testaren galdetegia
  }; // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko...

  let Laguntzailea = {
    state: "notcapturing", //notcapturing edo capturing
    lehenengoAldia: true, // True edo False (Lehenengo aldian sartu den edo ez zehazten du) (Hau plugina lehenengo aldian sartu den ala ez zehazten du)
    klikak: false, //True edo False (Egindako Klikak gorde behar diren edo ez zehazten du)
    teklak: false, //True edo False (Sakatutako Teklak gorde behar diren edo ez zehazten du)
    izena: "", //Erabiltzailearen izena
    dataAll: "", // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko
    hasierako_weba: "", //Nabigazio ez libre bada zein den hasierkao weba
    bukaera_puntua: "", // Nabigazio ez libre bada zein den bukaera puntuaren URL-a
    nabigazio_librea: "", // True edo False (Nabigazio libre bada edo ez zehazten du)
    bukaerako_botoia_class: "", // Nabegazio ez libre bada zein den bukaerako botoiaren propietatea edo beste botoietatik zer den desberdina
    birbidali: false, // True edo False (Hau true bada, orduan galdetegira birbidali erabiltzailea, bestela ez)
    klikop: 0, // Klik kopurua
    teklakop: 0, // Tekla kopurua
    dembora_segunduetan: 0, // Segundu kopurua
    testid: 1, // Testaren identifikadorea
    dembora_max: 0, // Testaren dembora maximoa
    galdetegia: "", // Testaren galdetegia
  }; // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko...

  // let konfigurazio_parametroak = {};
  let konfigurazio_parametroak1 = {};

  fs.readFile(
    path.join(__dirname, "test", `test${datos.testid}.json`),
    "utf8",
    (err, data) => {
      konfigurazio_parametroak = JSON.parse(data);
      //datos.state = "capturing"; //notcapturing edo capturing
      // True edo False (Lehenengo aldian sartu den edo ez zehazten du) (Hau plugina lehenengo aldian sartu den ala ez zehazten du)
      datos.klikak = konfigurazio_parametroak.parametroak.klikak; //True edo False (Egindako Klikak gorde behar diren edo ez zehazten du)
      datos.teklak = konfigurazio_parametroak.parametroak.teklak; //True edo False (Sakatutako Teklak gorde behar diren edo ez zehazten du)
      //datos.izena = datos.izena; //Erabiltzailearen izena
      // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko
      datos.hasierako_weba =
        konfigurazio_parametroak.parametroak.hasierako_weba; //Nabigazio ez libre bada zein den hasierkao weba
      datos.bukaera_puntua =
        konfigurazio_parametroak.parametroak.bukaera_puntua; // Nabigazio ez libre bada zein den bukaera puntuaren URL-a
      datos.nabigazio_librea =
        konfigurazio_parametroak.parametroak.nabegazio_librea; // True edo False (Nabigazio libre bada edo ez zehazten du)
      datos.bukaerako_botoia_class =
        konfigurazio_parametroak.parametroak.bukaerako_botoia_class; // Nabegazio ez libre bada zein den bukaerako botoiaren propietatea edo beste botoietatik zer den desberdina
      datos.dembora_max = konfigurazio_parametroak.parametroak.dembora_max; // Testaren dembora maximoa
      datos.galdetegia = konfigurazio_parametroak.parametroak.galdetegia;
    }
  );

  datos.lehenengoAldia = true;
  datos.dataAll = "";
  datos.birbidali = false; // True edo False (Hau true bada, orduan galdetegira birbidali erabiltzailea, bestela ez)
  datos.klikop = 0; // Klik kopurua
  datos.teklakop = 0; // Tekla kopurua
  datos.dembora_segunduetan = 0; // Segundu kopurua
  datos.testid = 1; // Testaren identifikadorea

  cont = 0;
  //////////////////////////////////////////////////////////////////////// Aldagiak ////////////////////////////////////////////////////////////////////

  app.use(bodyParser.urlencoded({ extended: true })); // URL-encoded eskaerak prozesatzeko
  app.use(bodyParser.json()); // JSON eskaerak prozesatzeko
  app.use(cors()); // CORS politikak aplikatzeko

  // CORS politikak aplikatzeko
  app.use(
    cors({
      origin: "*",
    })
  );

  // Zerbitzaria 3000 portuan entzuten jarri
  server = app.listen(3000, function () {
    console.log("Example app listening on port 3000!");
  });

  function hurrengoTesta() {
    if (datos.testid + 1 <= numberOfTests) {
      datos.testid = datos.testid + 1;
      console.log("Numero de id por el que vamos :" + datos.testid);
      //Hurrengo testa eman
      console.log(path.join(__dirname, "test", `test${datos.testid}.json`));
      fs.readFile(
        path.join(__dirname, "test", `test${datos.testid}.json`),
        "utf8",
        (err, data1) => {
          konfigurazio_parametroak1 = JSON.parse(data1);

          //Aldagai printzipala (datu guztiak gordetzeko)

          datos.state = "notcapturing"; //notcapturing edo capturing
          // True edo False (Lehenengo aldian sartu den edo ez zehazten du) (Hau plugina lehenengo aldian sartu den ala ez zehazten du)
          datos.klikak = konfigurazio_parametroak1.parametroak.klikak; //True edo False (Egindako Klikak gorde behar diren edo ez zehazten du)
          datos.teklak = konfigurazio_parametroak1.parametroak.teklak; //True edo False (Sakatutako Teklak gorde behar diren edo ez zehazten du)
          //datos.izena = datos.izena; //Erabiltzailearen izena
          // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko
          datos.hasierako_weba =
            konfigurazio_parametroak1.parametroak.hasierako_weba; //Nabigazio ez libre bada zein den hasierkao weba
          datos.bukaera_puntua =
            konfigurazio_parametroak1.parametroak.bukaera_puntua; // Nabigazio ez libre bada zein den bukaera puntuaren URL-a
          datos.nabigazio_librea =
            konfigurazio_parametroak1.parametroak.nabegazio_librea; // True edo False (Nabigazio libre bada edo ez zehazten du)
          datos.bukaerako_botoia_class =
            konfigurazio_parametroak1.parametroak.bukaerako_botoia_class; // Nabegazio ez libre bada zein den bukaerako botoiaren propietatea edo beste botoietatik zer den desberdina
          // Segundu kopurua
          datos.dembora_max = konfigurazio_parametroak1.parametroak.dembora_max; // Testaren dembora maximoa
          datos.galdetegia = konfigurazio_parametroak1.parametroak.galdetegia;
        }
      );
      datos.lehenengoAldia = true;
      datos.dataAll = "";

      datos.dataAll =
        "Start" +
        ":" +
        " " +
        datos.izena +
        " " +
        datos.testid +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        ";\n";

      datos.birbidali = true; // True edo False (Hau true bada, orduan galdetegira birbidali erabiltzailea, bestela ez)
      datos.klikop = 0; // Klik kopurua
      datos.teklakop = 0; // Tekla kopurua
      datos.dembora_segunduetan = 0;
      timeoutId = setTimeout(() => {
        console.log("{state: notcapturing}");
        bukatu().then(() => {
          hurrengoTesta();
        });
      }, datos.dembora_max);
    } else {
      datos.lehenengoAldia = true;
      datos.birbidali = true;
      datos.state = "notcapturing";
      datos.izena = "";
      datos.testid = numberOfTests + 1;
      datos.dataAll = "";
      console.log(datos);
    }
  }

  // MongoDB datu-basean datuak gorde (Sortuta ez bada, sortu)
  async function DBanGorde(datos) {
    if (datos.izena !== "") {
      // Bilatu erabiltzailea
      const existingUser = await db.findOne({
        erabiltzailea: datos.izena,
        testid: datos.testid,
      });
      if (existingUser) {
        // Erabiltzailea existitzen bada, datuak eguneratu
        await db.updateOne(
          { erabiltzailea: datos.izena, testid: datos.testid },
          {
            $set: {
              data: datos.dataAll,
              klikop: datos.klikop,
              teklakop: datos.teklakop,
              dembora_segunduetan: datos.dembora_segunduetan,
            },
          }
        );
        console.log(`Datuak eguneratuta ${datos.izena} erabiltzailearentzat.`);
        //console.log(datos.state);
      } else {
        // Ez bada existitzen, sortu erabiltzailea
        await db.create({
          erabiltzailea: datos.izena,
          data: datos.dataAll,
          klikop: datos.klikop,
          teklakop: datos.teklakop,
          dembora_segunduetan: datos.dembora_segunduetan,
          testid: datos.testid,
        });
        console.log(`Erabiltzailea : ${datos.izena} sortuta.`);
        //console.log(datos.state);
      }
    }
  }

  async function lortuTestBatenDatuak(datos) {
    console.log("Erabiltzailea" + datos.izena + "TestID" + datos.testid);
    datuBaseanDagoena = await db.findOne({
      erabiltzailea: datos.izena,
      testid: datos.testid,
    });
    return datuBaseanDagoena;
  }

  // Noiz hasi den jakinda, denbora segundutan kalkulatzeko funtzioa
  function calcularTiempoPasado(fechaInicio) {
    const ahora = new Date();
    const tiempoPasado = ahora - fechaInicio;

    // Convertir el tiempo pasado a segundos totales
    const segundosTotalesPasados = Math.floor(tiempoPasado / 1000);

    // Construir el mensaje de respuesta
    return segundosTotalesPasados;
  }

  //Testari bukaera ematen dion funtzioa
  async function bukatu() {
    //Bukaera eman
    datos.dataAll = datos.dataAll.concat(
      "End" +
        ":" +
        " " +
        datos.izena +
        " " +
        datos.testid +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n"
    );

    datos.dembora_segunduetan = calcularTiempoPasado(inicioTiempo);
    Laguntzailea = datos;

    // //DBanGord
    console.log(Laguntzailea);

    await DBanGorde(Laguntzailea);
  }

  // POST eskaera bat jaso denean eta /changeState helbidera eginda, hau exekutatuko da (Honek state aldagaia aldatzen du)
  app.post("/changeState", function (req, res) {
    console.log(req.body);
    //datos.state = req.body.state;
    //Capturing-ea aldatu nahi bada orduan hasierako denbora gorde eta dataAll hasieratu. Gainera dembora maximoa pasatzen bada, bukaerako prozedura egin.
    if (req.body.state === "capturing") {
      inicioTiempo = new Date();

      datos.dataAll =
        "Start" +
        ":" +
        " " +
        datos.izena +
        " " +
        datos.testid +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n";
      datos.state = req.body.state;
      DBanGorde(datos);

      //despues de un tiempo volver a cambiar el estado
      timeoutId = setTimeout(() => {
        console.log("{state: notcapturing}");
        bukatu().then(() => {
          hurrengoTesta();
        });
      }, datos.dembora_max); //Milisegundoetan
      //NotCapturing-ea aldatu nahi bada orduan aldagaiak reseteatu, lehen haitako "kontagailua" (setTimeout) ezabatu, azkeneko datuak gorde eta bukaera egin.
    } else if (req.body.state === "notcapturing") {
      clearTimeout(timeoutId);
      //DBanGorde(datos);
      bukatu().then(() => {
        hurrengoTesta();
      });
      console.log(datos);
    }
    res.send("Got a POST request");
  });

  // GET eskaera bat jaso denean eta /getState helbidera eginda, hau exekutatuko da (Honek datos aldagaia bueltatzen du, hau da, zer statean dagoen, zein den izena...)
  app.get("/getState", function (req, res) {
    res.send(datos);
  });
  // POST eskaera bat jaso denean eta /izena helbidera eginda, hau exekutatuko da (Honek izena aldagaia aldatzen du)
  app.post("/izena", function (req, res) {
    datos.izena = req.body.izena;
    datos.lehenengoAldia = true;
    res.send("Got a POST request");
  });
  // POST eskaera bat jaso denean eta /data helbidera eginda, hau exekutatuko da (Honek data aldagaia eguneratzen du et adatu basean eguneratu)
  app.post("/data", function (req, res) {
    if (req.body.testID === datos.testid) {
      if (req.body.klikop) {
        datos.klikop = req.body.klikop;
        console.log("Klikkopjasota");
      }
      if (req.body.teklakop) {
        datos.teklakop = req.body.teklakop;
        console.log("Teklakopjasota");
      }
      if (req.body.data !== "") {
        if (datos.dataAll !== "") {
          //lortuTestBatenDatuak(datos).then((datuBaseanDagoena) => {
          // console.log(datuBaseanDagoena);
          //if (!datuBaseanDagoena.data.includes("End")) {
          datos.dataAll = datos.dataAll.concat(req.body.data);
          DBanGorde(datos);
        }
        //});
        //}
      }
    }
    res.send("Got a POST request");
  });
  // POST eskaera bat jaso denean eta /login helbidera eginda, hau exekutatuko da (Honek login.html fitxategia kargatzen du)
  app.get("/login", function (req, res) {
    res.sendFile(path.join(baseDir + "/login.html"));
  });
  // POST eskaera bat jaso denean eta /popup helbidera eginda, hau exekutatuko da (Honek popup.html fitxategia kargatzen du)
  app.get("/popup", function (req, res) {
    res.sendFile(path.join(baseDir + "/popup.html"));
  });
  // POST eskaera bat jaso denean eta /birbidali helbidera eginda, hau exekutatuko da (Honek birbidali aldagaia aldatzen du)
  app.post("/birbidali", function (req, res) {
    datos.birbidali = req.body.data;
    console.log("birbidaliserver");
    res.send("Got a POST request");
  });
  app.post("/first", function (req, res) {
    datos.lehenengoAldia = req.body.data;
    console.log("firstserver");
    res.send("Got a POST request");
  });
  app.post("/galdetegiaBukatuta", function (req, res) {
    console.log("galdetegiaBukatuta");
    console.log(datos.testid);
    if (datos.testid <= numberOfTests) {
      inicioTiempo = new Date();
      datos.lehenengoAldia = true;
      datos.state = "capturing";
    } else {
      datos.testid = 1;
    }
  });
});
