// Crear relaciones 
import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import usuario from "./usuario.js"      
import Mensaje from "./Mensaje.js";

//Precio.hasOne(Propiedad) Con este metodo creamos la llave foranea que nos va a relacionar la propiedad con el precio y el codigo se interpreta de derecha a izquierda

// este meotodo es el mismo que de arriba solo cambia la interpretacion y la sintaxis
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'}); 
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'});
Propiedad.belongsTo(usuario, {foreignKey: 'usuarioId'});
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadId'}) 

Mensaje.belongsTo(Propiedad, { foreignKey: 'propiedadId'})
Mensaje.belongsTo(usuario, { foreignKey: 'usuarioId'})
export {
    Propiedad,
    Precio,
    Categoria,
    usuario,
    Mensaje
}