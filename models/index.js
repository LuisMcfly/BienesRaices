// Crear relaciones 
import Propiedad from "./Propiedad.js";
import Precio from "./Precio.js";
import Categoria from "./Categoria.js";
import usuario from "./usuario.js"      

//Precio.hasOne(Propiedad) Con este metodo creamos la llave foranea que nos va a relacionar la propiedad con el precio y el codigo se interpreta de derecha a izquierda

// este meotodo es el mismo que de arriba solo cambia la interpretacion y la sintaxis
Propiedad.belongsTo(Precio); 
Propiedad.belongsTo(Categoria);
Propiedad.belongsTo(usuario);  

export {
    Propiedad,
    Precio,
    Categoria,
    usuario
}