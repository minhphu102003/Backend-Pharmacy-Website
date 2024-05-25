import {config} from "dotenv";
config();

export const PORT = process.env.PORT||8080;

// Database
export const HOST = process.env.HOST || 'localhost';
export const USER = process.env.USER || 'root';
export const DATABASE = process.env.DATABASE || 'pharmacy';
export const PASSWORD = process.env.PASSWORD || '1234';

// Config jwwt

export const JWT_SECRET = 'your_jwt_secret_key';
export const JWT_EXPIRATION = '1h';


export const LIMITCATEGORY = process.env.LIMITCATEGORY|| 6;
export const LIMITMEDICINE = process.env.LIMITMEDICINE || 18;
export const LIMITBRAND = process.env.LIMITBRAND || 6;
export const LIMITCATEGORYDETAIL = process.env.LIMITCATEGORYDETAIL||6;
export const LIMITCATEGORYBLOG = process.env.LIMITCATEGORYBLOG|| 6;
export const LIMITBLOG  = process.env.LIMITBLOG || 8;

// email
export const EMAILUSERNAME = process.env.EMAILUSERNAME|| 'maddison53@ethereal.email';
export const EMAILPASSWORD = process.env.EMAILPASSWORD|| 'jn7jnAPss4f63QBp6D';
export const OTP_LENGTH = process.env.OTP_LENGTH || 6;
export const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT|| 'Xác Nhận Đăng Ký Tài Khoản';