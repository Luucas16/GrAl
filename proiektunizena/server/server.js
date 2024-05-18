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

let inicioTiempo; // Hasierako denbora gordeko duen aldagia

// Hasierako datuak irakurri, hau da, konfigurazioa
fs.readFile("conf.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // JSON fitxategiaren edukia irakurri
  const konfigurazio_parametroak = JSON.parse(data);

  //mongodb
  const mongoose = require("mongoose"); //Mongora konektatzeko
  // MongoDB esquema, hau da, datu-basean gordeko den informazioa nola gordeko den zehazten duen kodea
  const erabiltzaileEskema = new mongoose.Schema({
    erabiltzailea: String,
    data: String,
    klikop: Number,
    teklakop: Number,
    dembora_segunduetan: Number,
  });
  const db = mongoose.model("Proba", erabiltzaileEskema); //Modeloa sortu (Proba izeneko datu-basea)
  const DB_URL = konfigurazio_parametroak.parametroak.mongodb; //MongoDB URL-a
  mongoose.connect(DB_URL); //MongoDB-ra konektatu

  //Aldagai printzipala (datu guztiak gordetzeko)
  var datos = {
    state: "notcapturing", //notcapturing edo capturing
    lehenengoAldia: true, // True edo False (Lehenengo aldian sartu den edo ez zehazten du) (Hau plugina lehenengo aldian sartu den ala ez zehazten du)
    klikak: konfigurazio_parametroak.parametroak.klikak, //True edo False (Egindako Klikak gorde behar diren edo ez zehazten du)
    teklak: konfigurazio_parametroak.parametroak.teklak, //True edo False (Sakatutako Teklak gorde behar diren edo ez zehazten du)
    izena: "", //Erabiltzailearen izena
    dataAll: "", // Datuak, hau da, non egin duen klikak eta zer teklak sakatu dituen gordetzeko
    hasierako_weba: konfigurazio_parametroak.parametroak.hasierako_weba, //Nabigazio ez libre bada zein den hasierkao weba
    bukaera_puntua: konfigurazio_parametroak.parametroak.bukaera_puntua, // Nabigazio ez libre bada zein den bukaera puntuaren URL-a
    nabigazio_librea: konfigurazio_parametroak.parametroak.nabegazio_librea, // True edo False (Nabigazio libre bada edo ez zehazten du)
    bukaerako_botoia_class:
      konfigurazio_parametroak.parametroak.bukaerako_botoia_class, // Nabegazio ez libre bada zein den bukaerako botoiaren propietatea edo beste botoietatik zer den desberdina
    birbidali: false, // True edo False (Hau true bada, orduan galdetegira birbidali erabiltzailea, bestela ez)
    klikop: 0, // Klik kopurua
    teklakop: 0, // Tekla kopurua
    dembora_segunduetan: 0, // Segundu kopurua
  };
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
  app.listen(3000, function () {
    console.log("Example app listening on port 3000!");
  });

  // MongoDB datu-basean datuak gorde (Sortuta ez bada, sortu)
  async function DBanGorde(datos) {
    // Bilatu erabiltzailea
    const existingUser = await db.findOne({ erabiltzailea: datos.izena });
    if (datos.izena !== "") {
      if (existingUser) {
        // Erabiltzailea existitzen bada, datuak eguneratu
        await db.updateOne(
          { erabiltzailea: datos.izena },
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
      } else {
        // Ez bada existitzen, sortu erabiltzailea

        await db.create({
          erabiltzailea: datos.izena,
          data: datos.dataAll,
          klikop: datos.klikop,
          teklakop: datos.teklakop,
          dembora_segunduetan: datos.dembora_segunduetan,
        });
        console.log(`Erabiltzailea : ${datos.izena} sortuta.`);
      }
    }
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
  function bukatu() {
    //Bukaera eman
    datos.dataAll +=
      "End" +
      ":" +
      " " +
      datos.izena +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n";

    datos.dembora_segunduetan = calcularTiempoPasado(inicioTiempo);
    DBanGorde(datos).then(() => {
      //Datuak gorde ondoren, datuak reseteatu
      datos.izena = "";
      datos.dataAll = "";
      datos.klikop = 0;
      datos.teklakop = 0;
      datos.dembora_segunduetan = 0;
    });
  }

  // POST eskaera bat jaso denean eta /changeState helbidera eginda, hau exekutatuko da (Honek state aldagaia aldatzen du)
  app.post("/changeState", function (req, res) {
    console.log(req.body);
    datos.state = req.body.state;
    //Capturing-ea aldatu nahi bada orduan hasierako denbora gorde eta dataAll hasieratu. Gainera dembora maximoa pasatzen bada, bukaerako prozedura egin.
    if (datos.state === "capturing") {
      inicioTiempo = new Date();
      datos.dataAll =
        "Start" +
        ":" +
        " " +
        datos.izena +
        " " +
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
        "\n";
      //despues de un tiempo volver a cambiar el estado
      timeoutId = setTimeout(() => {
        console.log("{state: notcapturing}");
        datos.state = "notcapturing";
        DBanGorde(datos);
        bukatu();
        datos.lehenengoAldia = true;
        datos.birbidali = true;
      }, konfigurazio_parametroak.parametroak.dembora_max); //Milisegundoetan
      //NotCapturing-ea aldatu nahi bada orduan aldagaiak reseteatu, lehen haitako "kontagailua" (setTimeout) ezabatu, azkeneko datuak gorde eta bukaera egin.
    } else if (datos.state === "notcapturing") {
      datos.lehenengoAldia = true;
      datos.birbidali = true;
      clearTimeout(timeoutId);
      DBanGorde(datos);
      bukatu();
    }

    res.send("Got a POST request");
  });


  // GET eskaera bat jaso denean eta /getState helbidera eginda, hau exekutatuko da (Honek datos aldagaia bueltatzen du, hau da, zer statean dagoen, zein den izena...)
  app.get("/getState", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(datos);
  });
// POST eskaera bat jaso denean eta /izena helbidera eginda, hau exekutatuko da (Honek izena aldagaia aldatzen du)
  app.post("/izena", function (req, res) {
    datos.izena = req.body.izena;
    datos.lehenengoAldia = false;
    res.send("Got a POST request");
  });
// POST eskaera bat jaso denean eta /data helbidera eginda, hau exekutatuko da (Honek data aldagaia eguneratzen du et adatu basean eguneratu)
  app.post("/data", function (req, res) {
    if (req.body.data !== "") {
      if (req.body.klikop) {
        datos.klikop = req.body.klikop;
      }
      if (req.body.teklakop) {
        datos.teklakop = req.body.teklakop;
      }
      datos.dataAll = datos.dataAll.concat(req.body.data);

      DBanGorde(datos);
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
    datos.birbidali = req.body.birbidali;
    res.send("Got a POST request");
  });
});
