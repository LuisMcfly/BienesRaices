import  jwt  from "jsonwebtoken";
import { usuario } from "../models/index.js";

const protegerRuta = async (req, res, next) => {
    
    // Verificar si hay un token
    const { _token } = req.cookies
    if(!_token) {
        return res.redirect('/auth/login')
    }
    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const Usuario = await usuario.scope('eliminarPassword').findByPk(decoded.id)

        // Almacenar el usuario al req
        if(Usuario) {
            req.Usuario = Usuario
        }else {
            return res.redirect('/auth/login')
        }
        return next();
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default protegerRuta