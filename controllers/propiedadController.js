import { Precio, Categoria, Propiedad} from '../models/index.js'
import { validationResult } from "express-validator"
import { unlink } from 'node:fs/promises'


const admin = async (req, res) => {
    // Traer la informacion del usuario
    const { id } = req.Usuario
    const propiedades = await Propiedad.findAll({
        where: {
            usuarioId: id
        },
        include: [
            {model: Categoria, as: 'categoria'}, // Aqui estamos cruzando la informacion para poder obtener el nombre de el id que se esta relacionando en la tabla de propiedades
            {model: Precio, as: "precio"}
        ]
    })

    res.render('propiedades/admin', {
        pagina: 'Mis Propiedades',
        propiedades,
        csrfToken: req.csrfToken(),
    })
}


// Formulario para crear nuevas propiedades
const crear = async (req, res) => {
    // consultar a la base de datos por los precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

const guardar = async (req, res) => {
    // Validacion
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    // Crear un registro
    const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

const { id: usuarioId } = req.Usuario 

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion, 
            habitaciones, 
            estacionamiento, 
            wc, 
            calle, 
            lat, 
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const { id } = propiedadGuardada;
        res.redirect(`/propiedades/agregar-imagen/${id}`)
    } catch (error) {
        console.log(error);
    }

};

const agregarImagen = async (req, res) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertene a quien visita esta pagina
    if( req.Usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }


    res.render('propiedades/agregar-imagen', {
        pagina: `Hola ${req.Usuario.nombre} !! Aquí podras agregar las imagenes de: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req, res, next) => {
    const { id } = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertene a quien visita esta pagina
    if( req.Usuario.id.toString() !== propiedad.usuarioId.toString()){
        return res.redirect('/mis-propiedades')
    }

    try {

        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();
        next();
    } catch (error) {
        console.log(error);
    }
}

const editar = async (req, res) => {

    // Verificar la validacion
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params
    
    // Validar que la propiedad exista

    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que el que visitar la url sea el dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.Usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Consultar propiedad
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })

}

const guardarCambios = async (req, res) => {

    // Verificar la validacion
    let resultado = validationResult(req);

    if(!resultado.isEmpty()){

        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const { id } = req.params
    // Validar que la propiedad exista

    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que el que visitar la url sea el dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.Usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Reescribir el objeto y guardarlo

    try {
        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })


        await propiedad.save();

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error);
    }
}

const eliminar = async (req, res) => {

    // Nunca confies en los usuarios, siempre realiza los validaciones y asi te ahorras problemas jaja
    const { id } = req.params
    // Validar que la propiedad exista

    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }

    // Revisar que el que visitar la url sea el dueño de la propiedad

    if(propiedad.usuarioId.toString() !== req.Usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    // Eliminar la imagen que se aloja en la carpeta public - uploads
    await unlink(`public/uploads/${propiedad.imagen}`)

    // Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar
}