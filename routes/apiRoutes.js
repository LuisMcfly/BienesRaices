import express from 'express';
const router = express.Router();
import { propiedades } from '../controllers/apiController.js';

router.get('/propiedades', propiedades);

export default router;