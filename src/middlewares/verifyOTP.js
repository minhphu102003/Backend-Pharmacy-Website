// Phải xây dựng một talbe otp ở database
import otpModel from "../models/otpModels.js";

// Verify OTP provided by the user
export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otpString } = req.body;
        // Thực hiện một câu query vào bảng otp tại đây để xem otp có tồn tại không

        if (existingOTP) {
            // OTP is valid
            next();
        } else {
            // OTP is invalid
            res.status(400).json({ success: false, error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};