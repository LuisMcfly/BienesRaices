import express from 'express';
import { body } from 'express-validator';
import { admin, crear, guardar } from '../controllers/propiedadController.js';
import protegerRuta from '../middleware/protegerRuta.js';
const router = express.Router();

// Importamos express validator para hacer la respectiva validacion desde el routes y deberemos usar body en vez de usar check

router.get('/mis-propiedades', protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo no puede estar vacio !'),
    body('descripcion')
        .notEmpty().withMessage('Ups ! La descripcion no puede estar vacia')
        .isLength({ max: 200}).withMessage('La descripcion es demasiado larga !'),
    body('categoria').isNumeric().withMessage('Selecciona una categoria'),
    body('precio').isNumeric().withMessage('Selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la cantidad de estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la cantidad de baños'),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    guardar
);

export default router;