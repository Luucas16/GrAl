//express plantilla
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

//Gauzen kontrola jarraitzeko aldagaiak

var datos = {state: "notcapturing", lehenengoAldia: true , klikak: false, teklak: false};



app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors());

app.use(cors({
    origin: '*',
  }));


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    });

app.post('/changeState', function (req, res) {
    console.log(req.body);
    if (req.body.state === "capturing"){
        datos.lehenengoAldia = false;
    }else if (req.body.state === "notcapturing"){
        datos.lehenengoAldia = true;
    }
    datos.state = req.body.state;
    datos.klikak = req.body.klikak;
    datos.teklak = req.body.teklak;
    res.send('Got a POST request');
    });

app.get('/getState', function (req, res) {
    // console.log("getState");
   
    res.header('Access-Control-Allow-Origin', '*');
    res.send(datos);
    });


