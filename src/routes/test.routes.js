import { Router } from 'express';
import connection from '../database.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
    connection.query('SELECT * FROM user', (error, results) => {
        if (error) {
            console.error('Error fetching users:', error);
            return res.status(500).send('Internal Server Error');
        }
        res.json({
            success: true,
            data: results
        });
    });
});

export default router;