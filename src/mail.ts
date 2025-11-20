import nodemailer from 'nodemailer';
// codigo base: https://nodemailer.com/
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.TOKEN_MAIL,
  },
});


export async function enviarMail(to: string, certificado: string, titulo: string){
  const mailOptions = {
        from: '"AIDA API" <noreply@aida.com>',
        to: to,
        subject: "Certificado de Titulo en Tramite",
        text: `Felicidades!! Conseguiste el titulo de ${titulo}. Te enviamos tu certificado de titulo en Tramite`, // plain‑text body
        html: certificado,
    };

    return transporter.sendMail(mailOptions);

}
