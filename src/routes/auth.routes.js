import { Router, json } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connection from '../config/database.js';
import { JWT_SECRET, JWT_EXPIRATION } from '../config.js';
import  {sendOTP} from '../models/email.js';
import generateOTP from '../models/randomOTP.js';
import {otpStore} from '../app.js';

const router = Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Truy vấn người dùng và vai trò của họ từ cơ sở dữ liệu
    const query = `
        SELECT user.*, role.role as role_name 
        FROM user 
        JOIN role ON user.role_id = role.id 
        WHERE user.email = ?
    `;

    connection.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Email chưa được đăng ký!' });
        }

        const user = results[0];
        // ! Chưa làm mã hóa nên chưa so sánh bcrypt được
        // Kiểm tra mật khẩu
        // const passwordMatch = await bcrypt.compare(password, user.password);

        const passwordMatch = (password == user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Password is invalid!' });
        }

        // Tạo token JWT
        const accessToken = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role_name }, 
            JWT_SECRET, 
            { expiresIn: JWT_EXPIRATION }
        );

        // Tạo refresh token (tạo một cách thực sự nếu cần thiết)
        const refreshToken = jwt.sign(
            { id: user.user_id }, 
            JWT_SECRET, 
            { expiresIn: '7d' } // Thời hạn của refresh token có thể là một tuần
        );

        res.json({ 
            success: true,
            accessToken,
            refreshToken,
            type: user.role_name,
            roles: [{ authority: user.role_name }]
        });
    });
});


router.post("/register", async (req,res)=>{
    try{
        const{name, email, password} = req.body;
        const query = `
            SELECT email 
            FROM user
            WHERE email = ?
        `;
        connection.query(query, [email], async (error, results) =>{
            if(error){
                console.log('Error fetching register ',error);
                return res.status(500).json({message: 'Internal Server Error'});
            }
            if(results.length > 0){
                return res.status(409).json({message: 'Email đã tồn tại'});;
            }
            const otp = generateOTP();
            console.log(otp);
            const expiryTime = Date.now() + 5 * 60 * 1000; // 5 phút từ bây giờ
            otpStore[email] = { otp, expiryTime }; // Lưu trữ cả mã OTP và thời gian hết hạn
            await sendOTP(email,otp);
            return res.status(200).json({status: 200});
        });
    }
    catch(err){
        console.log('Error fetching register ',err);
        return res.status(500).json({message:'Internal Server Error'});
    }
});


router.post('/verify-email',async (req, res)=>{
    try{
        const {name, email, password, otp} = req.body;
        const   storedOtp = otpStore[email];
        if(! storedOtp){
            return res.status(400).json({message: 'OTP không tồn tại hoặc đã hết hạn'});
        }
        if(Date.now()> storedOtp.expiryTime){
            delete otpStore[email];
            return res.status(400).json({message: 'OTP đã hết hạn'});
        }
        if(storedOtp.otp !== otp){
            return res.status(400).json({message:'OTP không hợp lệ'});
        } 
        // ! Ở đây đơn giản nên ta chưa cần đến việc mã hóa mật khẩu 
        //  const hashedPassword = await bcrypt.hash(password, 10);
        const role = 1;
        const query = `
            INSERT INTO user(username, email, password, role_id)
            VALUES(?,?,?,?)
        `
        connection.query(query,[name,email,password,role], (error,result)=>{
            if(error){
                console.log('Error insert new user ', error);
                return res.status(500),json({message: 'Internal Server Error'});
            }
            delete otpStore[email];

            return res.status(201).json({ message: 'Đăng ký thành công' });
        });
    }catch(err){
        console.log('Error fetching verify email ',err);
        return res.status(500).json({message: 'Internal Server Error'});
    }
});


router.post('/logout', async (req,res)=>{
    return res.status(200).json({messge: 'Logout success '});
});

export default router;