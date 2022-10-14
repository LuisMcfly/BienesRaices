import bcrypt from 'bcrypt'

const Usuarios = [
    {
        nombre: 'Luchini',
        email: 'admin@admin.com',
        confirmado: 1,
        password: bcrypt.hashSync('1234567', 10),
    }
]

export default Usuarios