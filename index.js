// const express = require('express'); // Era la forma anterior en la que se exportaban paquetes en node y se llama CommonJS

import express from 'express'; // Nueva forma de importar el express con ECMAscript
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';
import propiedadesRoutes from './routes/propiedadesRoutes.js';
import appRoutes from './routes/appRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import db from './config/db.js'; // Aqui estamos importando la configuracion de la base de datos

// Crear el app
const app = express();

// Habilitar lectura de datos de formularios
app.use( express.urlencoded({extended: true}) );

// Habilitar cookie parser
app.use(cookieParser());

// Habilitar CSRF

app.use(csrf({cookie: true}));

// Conexion a la base de datos
try {
    await db.authenticate();
    db.sync();
    console.log('Conexion correcta a la base datos');
} catch (error) {
    console.log(error);
};

// Habilitar pug
app.set('view engine', 'pug');
app.set('views', './views');

// Carpeta public es el contenedor de archivos estaticos
app.use(express.static('public'));

// Routing
// Con . use lo que hacemos es decirle al app que tome todas las rutas que comiencen con el /. 

app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);

// Definir el puerto y arrancar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`servidor corriendo en el puerto ${port}`));


// Cada linea se conoce como middleware.
