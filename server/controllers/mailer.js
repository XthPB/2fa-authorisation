import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import ENV from '../config.js';


// https://ethereal.email/create
let nodeConfig = {
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: ENV.EMAIL, // generated ethereal user
        pass: ENV.PASSWORD, // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
})

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
    const { username, userEmail, text, subject } = req.body;

    // body of the email
    var email = {
        body : {
            name: username,
            intro : text || 'Welcome! We\'re very excited to have you on board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }

    var emailBody = MailGenerator.generate(email);

    let message = {
        from : ENV.EMAIL,
        to: userEmail,
        subject : subject || "Signup Successful",
        html : emailBody
    }

    // send mail
    transporter.sendMail(message)
        .then(() => {
            return res.status(200).send({ msg: "You should receive an email from us."})
        })
        .catch(error => res.status(500).send({ error }))

}

// import nodemailer from 'nodemailer';
// import Mailgen from 'mailgen';

// import ENV from '../config.js';

// // Update the nodeConfig to use Gmail SMTP
// let nodeConfig = {
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false,
//     auth: {
//         user: ENV.EMAIL, // your Gmail email address
//         pass: ENV.PASSWORD, // your Gmail password or an app-specific password
//     }
// }

// let transporter = nodemailer.createTransport(nodeConfig);

// let MailGenerator = new Mailgen({
//     theme: "default",
//     product: {
//         name: "Mailgen",
//         link: 'https://mailgen.js/'
//     }
// })

// export const registerMail = async (req, res) => {
//     const { username, userEmail, text, subject } = req.body;

//     var email = {
//         body: {
//             name: username,
//             intro: text || 'Welcome! We\'re very excited to have you on board.',
//             outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
//         }
//     }

//     var emailBody = MailGenerator.generate(email);

//     let message = {
//         from: ENV.EMAIL,
//         to: userEmail,
//         subject: subject || "Signup Successful",
//         html: emailBody
//     }

//     try {
//         // send mail
//         await transporter.sendMail(message);
//         return res.status(200).send({ msg: "You should receive an email from us." });
//     } catch (error) {
//         console.error('Error sending email:', error);
//         return res.status(500).send({ error });
//     }
// }
