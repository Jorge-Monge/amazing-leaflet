var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

const { GMAIL_USER, GMAIL_PASSWORD } = process.env;

var messageFromServer = {};

transporter = nodemailer.createTransport(
    smtpTransport({
        //host: 'smtp.mail.yahoo.com',
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        service: 'Gmail',
        //service: 'yahoo',
        auth: { user: GMAIL_USER,
        pass: GMAIL_PASSWORD },
        debug: false,
        logger: true,
        tls: { rejectUnauthorized: false } }));

async function sendEmail(to_email) {

    var mailOptions = {
        from: 'jaymont847@gmail.com',
        to: to_email,
        subject: 'Email from Web Mapping App',
        text: 'A new position was recorded in the web map at https://www.ict-442.jorgemonge.ca/assignment_4\n' +
        'If this wasn\'t you, please contact the author at jaymont847@gmail.com\n' +
        '\nThank you!\n'
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                messageFromServer = error;
                reject(`Something went wrong: ${error}`);
            } else {
                messageFromServer = `Email sent: ${info.response}`;
                resolve();
            }
        }); // 'transporter...' ends
    });
}



exports.handler = async function (event, context, callback) {

    var httpMessage = JSON.parse(event.body).httpMessage;
    var to_email = httpMessage.to_email;

    var response = await sendEmail(to_email);
            callback(null, {
                statusCode: 200,
                headers: {
                    'Accept': "application/json",
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Origin, x-Requested-Width, Content-Type, Accept'
                },
                body: JSON.stringify(messageFromServer)
            }) // Returns JSON
}