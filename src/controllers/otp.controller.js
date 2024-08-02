import randomstring from  'randomstring';
import sendEmail from '../services/sendMail.js';

function generateOTP() {
    return randomstring.generate({
        length: 6,
        charset: 'numeric'
    });
}

// Send OTP to the provided email
export const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = generateOTP(); // Generate a 6-digit OTP
        // ! Lưu email và otp vào database
        await newOTP.save();

        // Send OTP via email
        await sendEmail({
            to: email,
            subject: 'Your OTP for register Smart City',
            text: `<p>Your OTP is: <strong>${otp}</strong></p>`,
        });

        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};