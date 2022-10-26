import jwt from 'jsonwebtoken'
import usuario from '../models/usuario.js'

const identificarUsuario = async (req, res, next) => {
    // Identificar si hay un token
    const { _token } = req.cookies
    if(!_token) {
        req.usuario = null
        return next()
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const Usuario = await usuario.scope('eliminarPassword').findByPk(decoded.id)

        if(Usuario){
            req.usuario = Usuario
        }
        return next();
    } catch (error) {
        console.log(error);
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default identificarUsuario