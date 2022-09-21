var nodemailer = require('nodemailer');
require('dotenv').config();
async function send365Email(from,to,subject,html,text,attachments) {
    try { 
        console.log("mail enter");
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
        console.log("email sent successfully");
            let responseData =
            {
                "statusCode": 200,
                "message": messages.emailSend
            };
            const jsonContent = JSON.stringify(responseData);
            res.status(200).end(jsonContent);
            return res;
    } catch (err) { 
        // console.error(`send365Email: An error occurred:`, err);
        // console.log("error");
        console.log("error");
    }
}
module.exports ={
    send365Email
}