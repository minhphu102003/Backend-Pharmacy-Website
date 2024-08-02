import { Router } from "express";
import connection from "../config/database.js";
import { LIMITCATEGORYBLOG } from "../config.js";

const router = Router();

router.get('/list-categories', async (req, res) => {
    try {
        const { limit } = req.query;
        if (!limit) {
            const query = `
                SELECT blogcategory_id as id, name 
                FROM blogcategory
                LIMIT ?
            `;
            connection.query(query, [LIMITCATEGORYBLOG], (error, results) => {
                if (error) {
                    console.log('Error fetching list category blog ', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'Data not found!' });
                }
                return res.status(200).json({ listCategory: results });
            });
        } else {
            const query = `
                SELECT blogcategory_id as id, name 
                FROM blogcategory
            `;
            connection.query(query, (error, results) => {
                if (error) {
                    console.log('Error fetching list category blog ', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (results.length === 0) {
                    return res.status(404).json({ message: 'Data not found' });
                }
                return res.status(200).json({ listCategory: results });
            });
        }
    } catch (err) {
        console.log('Error fetching list category blog ', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
