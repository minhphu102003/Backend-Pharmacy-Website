import { Router } from "express";
import connection from "../database.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/overview", authenticateAdmin, async (req, res) => {
    try {
        const query = `
            SELECT 
                SUM(CASE WHEN role.role = 'admin' THEN 1 ELSE 0 END) AS admin_count,
                SUM(CASE WHEN role.role = 'user' THEN 1 ELSE 0 END) AS user_count,
                SUM(CASE WHEN role.role = 'staff' THEN 1 ELSE 0 END) AS staff_count,
                (SELECT COUNT(*) FROM blog) AS blog_count
            FROM user
            JOIN role ON user.role_id = role.id;
        `;

        connection.query(query, (error, results) => {
            if (error) {
                console.error('Error fetching dashboard data:', error);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'No data found' });
            }

            const dashBoardNumberCount = {
                NumberAdminAccount: results[0].admin_count,
                NumberUserAccount: results[0].user_count,
                NumberStaffAccount: results[0].staff_count,
                NumberBlog: results[0].blog_count
            };
            
            res.status(200).json(dashBoardNumberCount);
        });
    } catch (err) {
        console.log('Error fetching dashboard data:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;