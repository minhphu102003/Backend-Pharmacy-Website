import { Router, json } from "express";
import connection from "../config/database.js";
import { LIMITBRAND } from "../config.js";


const router = Router();

// Brand không cần có params
router.get('/list-brands',async (req,res)=>{
    try{
        const query = `
            SELECT brand_id as id,brandName as name, logo 
            FROM brand
            LIMIT ?
        `
        connection.query(query, [LIMITBRAND],(error,results)=>{
            if(error){
                console.log('Error fetching list brand ',error);
                return res.status(500).json({message: 'Internal Server Error'})
            }
            if(results.length === 0 ){   
                return res.status(404).json({message: 'Database no brand'})
            }
            return res.status(200).json({listBrand: results})
        });
    }catch(err){
        console.log('Error fetching list brand ',err);
        return res.status(500).json({message:'Internal Server Error'})
    }
}); 

//  Thêm brand 
//  Sửa brand
// Xóa brand

export default router;