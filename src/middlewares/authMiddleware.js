import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import connection from '../database.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        req.user = user.id;
        next();
    });
};


export const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
        }

        const userId = decodedToken.id;

        const query = `
            SELECT role.role AS role_name 
            FROM USER 
            JOIN role ON user.role_id = role.id
            WHERE user.user_id = ?
        `;

        connection.query(query, [userId], (error, results) => {
            if (error) {
                console.log('Error middleware for authenticate Admin', error);
                return res.sendStatus(500); // Internal Server Error
            }
            if (results.length === 0) {
                return res.sendStatus(404); // User not found
            }

            const roleName = results[0].role_name;

            // Kiểm tra vai trò của người dùng
            if (roleName !== 'admin') {
                return res.sendStatus(401); // Unauthorized
            }

            // Nếu là admin, tiếp tục xử lý yêu cầu
            next();
        });
    });
};

