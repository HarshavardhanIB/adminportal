var nodemailer = require('nodemailer');
require('dotenv').config();
async function send365Email(from,to,subject,html,text,attachments) {
    try { 
        const transportOptions = {
            host: 'smtp-mail.outlook.com',
            secureConnection: false, 
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS
                }
        };    
        const mailTransport = nodemailer.createTransport(transportOptions);    
        await mailTransport.sendMail({
            from,
            to,
            replyTo: from,
            subject,
            html,
            text,
            attachments
        });
    } catch (err) { 
        console.error(`send365Email: An error occurred:`, err);
    }
}
module.exports ={
    send365Email
}