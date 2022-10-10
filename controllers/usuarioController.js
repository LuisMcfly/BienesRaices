import { check, validationResult} from 'express-validator'
import usuario from "../models/usuario.js"
import { generarId } from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/emails.js'

const formularioLogin = (req, res) => {res.render('auth/login', {
    pagina: 'Login'
})
}

const formularioRegistro = (req, res) => {
    

    res.render('auth/registro', {
    pagina: 'Crear Cuenta',
    csrfToken: req.csrfToken()
})
}

// Logica para la creacion del usuario
const registrar = async (req, res) => {
    // Validacion
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener por lo menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)

    //Mostrar errores y hacer la validacion
    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/registro', {
                pagina: 'Crear Cuenta',
                errores: resultado.array(),
                usuario: {
                    nombre: req.body.nombre,
                    email: req.body.email
                }
        })
    }

    // Extraer los datos
    const { nombre, email, password } = req.body
    // Verificar que el usuario no este duplicado
    const existeUsuario = await usuario.findOne( { where : { email } })
    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Usuario ya esta Registrado'}], 
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    // Almacenar un usuario
    const usuarioC = await usuario.create({
        nombre, 
        email,
        password,
        token: generarId()
    })

    // Envia email de confirmacion
    emailRegistro({
        nombre: usuarioC.nombre,
        email: usuarioC.email,
        token: usuarioC.token
    })

    // Mostrar mensaje de confirmacion !
    res.render('templates/mensaje', {
        pagina: 'cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmacion, presiona en el enlace'
    })
} 

// Funcion para comprobar una cuenta

const confirmar = async (req,res) => {
    const { token } = req.params;
    
    // Verificar si el token es valido
    const Usuario = await usuario.findOne({ where: {token}})

    if(!Usuario){
        return res.render('auth/confirmarCuenta',{
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    // Confirmar la cuenta
    Usuario.token = null;
    Usuario.confirmado = true;
    await Usuario.save();

    res.render('auth/confirmarCuenta',{
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmo con exito'
    })

}

const formularioRecuperarPassword = (req, res) => {res.render('auth/recuperar-password', {
    pagina: 'Recuperar Contraseña',
    csrfToken: req.csrfToken()
})
}

const resetPassword = (req, res) => {
    
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioRecuperarPassword,
    resetPassword
} // Aqui estamos importando con export y podriamos incluir varias funciones mas dentro del objeto a diferencia del siguiente que solo podemos exportar uno por archivo

// export default formularioLogin; 