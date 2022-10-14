import { check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import usuario from "../models/usuario.js"
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailRecuperarPassword } from '../helpers/emails.js'

const formularioLogin = (req, res) => {res.render('auth/login', {
    pagina: 'Iniciar Sesión',
    csrfToken: req.csrfToken()
})
}

const autenticar = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('El email es obligatorio').run(req)
    await check('password').notEmpty().withMessage('La contraseña es obligatoria').run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado no este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/login', {
                pagina: 'Iniciar Sesión',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
        })
    }

    // Comprobar si el usuario existe

    const {email, password} = req.body;

    const Usuario = await usuario.findOne({where : {email}});
    if(!Usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario no existe'}]
        })
    }

    // Comprobar si el usuario esta confirmado
    if(!Usuario.confirmado){
        return res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken(),
        errores: [{msg: 'Tu cuenta no ha sido confirmada'}]
    })
    }
    // Revisar el password

    if(!Usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'La contraseña es incorrecta'}]
        })
    }

    // Autenticar al usuario
    const token = generarJWT({id: Usuario.id, nombre: Usuario.nombre});
    

    // Almacenar en un cookie

    return res.cookie('_token', token, {
        httpOnly: true
        // secure: true,
        // sameSite: true
    }).redirect('/mis-propiedades')
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
                csrfToken: req.csrfToken(),
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

const resetPassword = async (req, res) => {
    // Validacion
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    
    //Mostrar errores y hacer la validacion
    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        // Errores
        return res.render('auth/recuperar-password', {
            pagina: 'Recuperar Contraseña',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }

    // Buscar el usuario
    const { email } = req.body

    const Usuario = await usuario.findOne({where: {email}});
    if(!Usuario){
        return res.render('auth/recuperar-password', {
            pagina: 'Recuperar Contraseña',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El email no se encuentra registrado'}]
        })
    }

    // Generar un token y enviar el email
    Usuario.token = generarId();
    await Usuario.save();

    // Enviar email
    emailRecuperarPassword({
        email: Usuario.email,
        nombre: Usuario.nombre,
        token: Usuario.token
    })

    // Renderizar un mensaje
    res.render('templates/mensaje', {
        pagina: 'Reestablece tu contraseña',
        mensaje: 'Hemos enviado un email con las instrucciones'
    })
}

const comprobarToken = async (req,res) => {
    const { token } = req.params;

    const Usuario = await usuario.findOne({where: {token}})
    if(!Usuario){
        return res.render('auth/confirmarCuenta',{
            pagina: 'Restablece tu contraseña',
            mensaje: 'Hubo un error al validar tu información, intentalo nuevamente',
            error: true
        })
    }

    // Mostrar un formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu contraseña',
        csrfToken: req.csrfToken()
    })
}

const nuevoPassword = async (req,res) => {
    // Validar el password
    await check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener por lo menos 6 caracteres').run(req)

    let resultado = validationResult(req)

    //Verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        return res.render('auth/reset-password', {
                pagina: 'Reestablece tu contraseña',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
        })
    }

    const { token } = req.params
    const { password } = req.body;
    // Indentificar quien hace la peticion
    const Usuario = await usuario.findOne({where: {token}})

    // Hashear el nuevo password
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash( password, salt);
    Usuario.token = null;

    await Usuario.save();

    res.render('auth/confirmarCuenta', {
        pagina: 'Contraseña modificada',
        mensaje: 'La nueva contraseña se guardo con exito'
    })
}

export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    registrar,
    confirmar,
    formularioRecuperarPassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
} // Aqui estamos importando con export y podriamos incluir varias funciones mas dentro del objeto a diferencia del siguiente que solo podemos exportar uno por archivo

// export default formularioLogin; 