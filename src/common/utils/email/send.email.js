import nodemailer from "nodemailer";
import { EMAIL, PASSWORD } from "../../../../config/config.service.js";



export const sendEmail = async(
    {to , subject , html , attachments}
)=>{
    
const transporter = nodemailer.createTransport({
    service: "gmail",
    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, //true = port : 465 , false = port :587
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    },
    });
    

    const info = await transporter.sendMail({
        from: `"evraym" <${EMAIL}>`,
        to,
        subject: "Hello ✔",
        text: "Hello world?", 
        html: "<b>Hello world?</b>", 
        attachments: attachments || []
});

    console.log("Message sent:", info.messageId);

    return info.accepted.length > 0 ? true : false;

}

export const genertaeOtp = async () => {
    return Math.floor(Math.random()*900000 + 100000)
}