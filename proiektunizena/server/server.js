var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
//mongodb
const mongoose = require("mongoose");
const DB_URL = "mongodb://127.0.0.1:27017/GrAl";
mongoose.connect(DB_URL);

const erabiltzaileEskema = new mongoose.Schema({
  username: String,
  data: String,
});

const db = mongoose.model("Proba", erabiltzaileEskema);

var datos = {
  state: "notcapturing",
  lehenengoAldia: true,
  klikak: false,
  teklak: false,
  izena: "",
  dataAll: "",
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

app.post("/changeState", function (req, res) {
  console.log(req.body);
  datos.state = req.body.state;
  if (datos.state === "capturing") {
    datos.lehenengoAldia = true;
  } else if (datos.state === "notcapturing") {
    datos.lehenengoAldia = false;

    db.create({ username: datos.izena, data: datos.dataAll }).then(() => {
      datos.izena = "";
      datos.dataAll = "";
    });
  }

  datos.klikak = req.body.klikak;
  datos.teklak = req.body.teklak;
  res.send("Got a POST request");
});

app.get("/getState", function (req, res) {
  // console.log("getState");

  res.header("Access-Control-Allow-Origin", "*");
  res.send(datos);
});
app.post("/izena", function (req, res) {
  datos.izena = req.body.izena;
  res.send("Got a POST request");
});

app.post("/data", function (req, res) {
  if (req.body.data !== "") {
    datos.dataAll = datos.dataAll.concat(req.body.data); 
  }

  res.send("Got a POST request");
});
