import { Router } from "express";
import connection from "../database.js";
import { LIMITCATEGORY } from "../config.js";

const router = Router();

router.get("/categories", async (req,res) =>{
    const query = `
        SELECT *
        FROM category
        LIMIT ?
    `
    connection.query(query, [LIMITCATEGORY],(error,result)=>{
        if(error){
            console.log('Error fetching category');
            return res.status(500).send('Internal Server Error');
        }
        if(result.length===0){
            return res.status(404).json({message: 'Không có category nào'});
        }
        const sendObject = {
            listCategories:result,
            categoryQuantity: 0
        }
        return res.status(200).json(sendObject);
    })
})

export default router;