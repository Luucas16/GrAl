//express plantilla
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');

var state = { state: "notcapturing" };

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
    state = req.body;
    res.send('Got a POST request');
    });

app.get('/getState', function (req, res) {
    // console.log("getState");
   
    res.header('Access-Control-Allow-Origin', '*');
    res.send(state);
    });
