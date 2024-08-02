import nodeMailer  from 'nodemailer'; 

const sendMail = async (option) =>{
    const transporter = nodeMailer .createTransport({
        host: process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        secure: false, // Use SSL
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_APP_PASS,
        },
        authMethod: 'LOGIN', // Specify the authentication method
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: option?.to,
        subject: option?.subject,
        text: option?.text,
        html: option?.html,
    };

    await transporter.sendMail(mailOptions);
}

export default sendMail; // Thêm dòng này để export hàm sendMail như một export mặc định