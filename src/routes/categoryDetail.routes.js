import { Router } from "express";
import connection from "../config/database.js";
import { LIMITCATEGORYDETAIL } from "../config.js";

const router = Router();

router.get('/list-categoriesDetail', async (req, res) => {
    try {
        const { category_id,limit } = req.query;
        const limitInt = limit ? parseInt(limit,10): null;
        const categoryInt = category_id ? parseInt(category_id,10): null;
        let query;
        let queryParams;
        if(categoryInt && (limitInt === 0) ){
            query = `
            SELECT categoryDetail_id as id , categoryDetailName as name
            FROM categoryDetail
            WHERE category_id = ?
        `;
        queryParams = [categoryInt];
        }
        else if(categoryInt && limitInt){
            query = `
            SELECT categoryDetail_id as id , categoryDetailName as name
            FROM categoryDetail
            WHERE category_id = ?
            LIMIT ?
        `;
        queryParams = [categoryInt, limit];
        }
        else if (limitInt === 0 ){
            query = `
            SELECT categoryDetail_id as id , categoryDetailName as name
            FROM categoryDetail
        `;
        queryParams = [];
        }
        else{
            query = `
            SELECT categoryDetail_id as id , categoryDetailName as name
            FROM categoryDetail
            LIMIT ?
        `;
        queryParams = [LIMITCATEGORYDETAIL];
        }
        connection.query(query, queryParams, (error, results) => {
            if (error) {
              console.log("Error fetching medicine list ", error);
              return res.status(500).json({ message: 'Internal Server Error' });
            }
            if (results.length === 0) {
              return res.status(404).json({ message: 'No data in database' });
            }
            return res.status(200).json({ listCategoriesDetail: results });
          });
    } catch (err) {
        console.log('Error fetching list category detail ', err);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

export default router;
