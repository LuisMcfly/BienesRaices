import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const { email, nombre, token} = datos;

      // Enviar el email

      await transport.sendMail({
        from: 'BienesRaciones.com',
        to: email,
        subject: 'confirma tu cuenta en BienesRaices.com',
        text: 'confirma tu cuenta en BienesRaices.com',
        html: ` <p>hola ${nombre}, confirma tu cuenta en BienesRaices.com !!</p>
                <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enlace: 
                <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token} ">Confirmar cuenta</a></p>
                <p>Si tu no creaste la cuenta, puedes ignorar el mensaje</p>
                `
      })
}

export { 
    emailRegistro
}