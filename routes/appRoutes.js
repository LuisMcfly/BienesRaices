import express  from "express";
import { inicio, categoria, noEncontrado, Buscador } from '../controllers/appController.js'


const router = express.Router();

// Pagina de inicioo 
router.get('/', inicio);

// Pagina 404
router.get('/404', noEncontrado);

// Categorias
router.get('/categorias/:id', categoria);

// Buscador
router.post('/buscador', Buscador);


export default router;

