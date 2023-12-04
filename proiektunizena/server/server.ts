// Hazme Un servidor usando express que escuche en el puerto 3000
// y que responda a las peticiones con un "Hola Mundo!"
// Usa el metodo listen de express
// Tu codigo aqui
import express,{Application} from 'express';
var app: Application = express();



app.listen(3000, function () {
    console.log('Zerbitzaria martxan dago!');
    }
);

