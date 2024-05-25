
export default function generateOTP() {
    // Tạo một số ngẫu nhiên từ 0 đến 999999 (bao gồm cả 6 chữ số)
    let otp = Math.floor(Math.random() * 1000000);
    // Đảm bảo rằng OTP luôn có 6 chữ số bằng cách thêm số 0 ở đầu nếu cần
    otp = otp.toString().padStart(6, '0');
    return otp;
}