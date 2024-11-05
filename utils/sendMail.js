const nodemailer = require('nodemailer');

module.exports = ({ receiver, subject, htmlMessage }) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SERVER_EMAIL,
            pass: process.env.EMAIL_SECURITY_KEY
        },
        authMethod: 'LOGIN' // Specify the authentication method as LOGIN
    });

    var mailOptions = {
        from: process.env.SERVER_EMAIL,
        to: receiver,
        subject: subject,
        html: htmlMessage
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
