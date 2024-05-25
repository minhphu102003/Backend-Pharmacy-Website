import nodemailer from 'nodemailer';
import { EMAILPASSWORD, EMAILUSERNAME, EMAIL_SUBJECT } from '../config.js';


export async function sendOTP(email, otp){
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth :{
            user: EMAILUSERNAME,
            pass: EMAILPASSWORD
        }
    });
    const mailOption = {
        from: EMAILUSERNAME,
        to: email,
        subject: EMAIL_SUBJECT,
        text: `Mã OTP của bạn là ${otp}`
    };
    await transporter.sendMail(mailOption);
}