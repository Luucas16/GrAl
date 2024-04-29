const fs = require("fs");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
var moment = require("moment");
const path = require("path");

// Define la ruta base de tu proyecto
const baseDir = path.join(__dirname, "..");

//mongodb
const mongoose = require("mongoose");
const { serialize } = require("v8");

const erabiltzaileEskema = new mongoose.Schema({
  username: String,
  data: String,
  klikop: Number,
  teklakop: Number,
  dembora_segunduetan: Number,
});

const db = mongoose.model("Proba", erabiltzaileEskema);

let inicioTiempo;
let intervalId;

fs.readFile("conf.json", "utf8", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Analizar el contenido JSON
  const konfigurazio_parametroak = JSON.parse(data);

  const DB_URL = konfigurazio_parametroak.parametroak.mongodb;
  mongoose.connect(DB_URL);

  var datos = {
    state: "notcapturing",
    lehenengoAldia: true,
    klikak: konfigurazio_parametroak.parametroak.klikak,
    teklak: konfigurazio_parametroak.parametroak.teklak,
    izena: "",
    dataAll: "",
    hasierako_weba: konfigurazio_parametroak.parametroak.hasierako_weba,
    bukaera_puntua: konfigurazio_parametroak.parametroak.bukaera_puntua,
    nabigazio_librea: konfigurazio_parametroak.parametroak.nabegazio_librea,
    bukaerako_botoia_class : konfigurazio_parametroak.parametroak.bukaerako_botoia_class,
    birbidali: false,
    klikop: 0,
    teklakop: 0,
    dembora_segunduetan: 0,
    oraingo_helbidea: "",
  };

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use(
    cors({
      origin: "*",
    })
  );

  app.listen(3000, function () {
    console.log("Example app listening on port 3000!");
  });

  async function DBanGorde(datos) {
    // Buscar un documento con el username dado
    const existingUser = await db.findOne({ username: datos.izena });
    if (datos.izena !== "") {
      if (existingUser) {
        // Si el usuario ya existe, actualizar su data
        await db.updateOne(
          { username: datos.izena },
          {
            $set: {
              data: datos.dataAll,
              klikop: datos.klikop,
              teklakop: datos.teklakop,
              dembora_segunduetan: datos.dembora_segunduetan,
            },
          }
        );
        console.log(`Datos actualizados para el usuario ${datos.izena}.`);
      } else {
        // Si el usuario no existe, crear uno nuevo

        await db.create({
          username: datos.izena,
          data: datos.dataAll,
          klikop: datos.klikop,
          teklakop: datos.teklakop,
          dembora_segunduetan: datos.dembora_segunduetan,
        });
        console.log(`Nuevo usuario ${datos.izena} creado.`);
      }
    }
  }
  function calcularTiempoPasado(fechaInicio) {
    const ahora = new Date();
    const tiempoPasado = ahora - fechaInicio;

    // Convertir el tiempo pasado a segundos totales
    const segundosTotalesPasados = Math.floor(tiempoPasado / 1000);

    // Construir el mensaje de respuesta
    return segundosTotalesPasados;
  }
  function bukatu() {
    const tiempoPasado = calcularTiempoPasado(inicioTiempo); // Calcula el tiempo pasado
    datos.dataAll +=
      "End" +
      ":" +
      " " +
      datos.izena +
      " " +
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") +
      "\n";

    datos.dembora_segunduetan = tiempoPasado;
    DBanGorde(datos).then(() => {
      datos.izena = "";
      datos.dataAll = "";
      datos.klikop = 0;
      datos.teklakop = 0;
      datos.dembora_segunduetan = 0;
    });
  }

  app.post("/changeState", function (req, res) {
    console.log(req.body);
    datos.state = req.body.state;
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
    } else if (datos.state === "notcapturing") {
      datos.lehenengoAldia = true;
      datos.birbidali = true;
      clearTimeout(timeoutId);
      DBanGorde(datos);
      bukatu();
    }

    res.send("Got a POST request");
  });

  app.get("/getState", function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send(datos);
  });

  app.post("/izena", function (req, res) {
    datos.izena = req.body.izena;
    datos.lehenengoAldia = false;
    res.send("Got a POST request");
  });

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

  app.get("/login", function (req, res) {
    res.sendFile(path.join(baseDir + "/login.html"));
  });

  app.get("/popup", function (req, res) {
    res.sendFile(path.join(baseDir + "/popup.html"));
  });

  app.post("/birbidali", function (req, res) {
    datos.birbidali = req.body.birbidali;
    res.send("Got a POST request");
  });
});
