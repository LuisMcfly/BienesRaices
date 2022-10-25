import { Precio, Categoria, Propiedad } from '../models/index.js'

const inicio = async (req, res) => {

    const [ categorias, precios, casas, departamentos ] = await Promise.all([
        Categoria.findAll({raw: true}),
        Precio.findAll({raw: true}),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 1
            },
            include: [
                {model: Precio, as: 'precio'}
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
        Propiedad.findAll({
            limit: 3,
            where: {
                categoriaId: 2
            },
            include: [
                {model: Precio, as: 'precio'}
            ],
            order: [
                ['createdAt', 'DESC']
            ]
        }),
    ])

    res.render('inicio', {
        pagina: 'inicio',
        categorias,
        precios,
        casas,
        departamentos
    })
}


const categoria = (req, res) => {
    
}

const noEncontrado = (req, res) => {
    
}

const Buscador = (req, res) => {
    
}


export {
    inicio,
    categoria,
    noEncontrado,
    Buscador
}