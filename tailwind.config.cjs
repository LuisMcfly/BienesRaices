/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.pug'], // Los * HAcen referencia a que no importa el nombre de la carpeta o el nombre los archivos, que solamente debe incluir los estilos en los .pug que son template engines 
  theme: {
    extend: {},
  },
  plugins: [],
}
