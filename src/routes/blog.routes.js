import { Router } from "express";
import connection from "../config/database.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import { LIMITBLOG } from "../config.js";

const router  = Router();

// router.get('/list-blog', async (req,res)=>{
//     const {limit} = req.query;
//     const limitParse = limit ? parseInt(limit, 10) : null;

//     let query;
//     let queryParams;
//     if(limitParse){
//         query = `
//             SELECT title, blog_id as id, image ,description ,c.blogCategory_id,datePublished as date ,reference, name as categoryName
//             FROM blog 
//             JOIN blogcategory as c ON c.blogcategory_id  = blog.blogCategory_id
//             WHERE status  = 'published'
//             LIMIT ?
//         `;
//         queryParams = [limitParse];
//     }
   
//     connection.query(query, queryParams, (error,results)=>{
//         if (error) {
//             console.log("Error fetching medicine list ", error);
//             return res.status(500).json({ message: 'Internal Server Error' });
//           }
//           if (results.length === 0) {
//             return res.status(404).json({ message: 'No data in database' });
//           }
//           return res.status(200).json({ listBlog: results });
//     });
// });


router.get('/list-blog', async (req, res) => {
  const { status, limit, page } = req.query;
  const statusStr = status ? status.toString() : null;
  const limitInt = limit ? parseInt(limit, 10) : LIMITBLOG;
  const pageInt = page ? parseInt(page, 10) : 1;

  let query;
  let countQuery;
  let queryParams = [];
  
  try {
    if (statusStr === '3') {
      query = `
        SELECT title, blog_id as id, image, description, c.blogCategory_id, datePublished as date, reference, name as categoryName
        FROM blog
        JOIN blogcategory as c ON c.blogCategory_id = blog.blogCategory_id
        WHERE status = 'draft'
        LIMIT ? OFFSET ?
      `;
      countQuery = `
        SELECT COUNT(*) as total
        FROM blog
        WHERE status = 'draft'
      `;
    } else if (statusStr === '0') {
      query = `
        SELECT title, blog_id as id, image, description, c.blogCategory_id, datePublished as date, reference, name as categoryName
        FROM blog
        JOIN blogcategory as c ON c.blogCategory_id = blog.blogCategory_id
        WHERE status = 'published'
        LIMIT ? OFFSET ?
      `;
      countQuery = `
        SELECT COUNT(*) as total
        FROM blog
        WHERE status = 'published'
      `;
    } else {
      query = `
        SELECT title, blog_id as id, image, description, c.blogCategory_id, datePublished as date, reference, name as categoryName
        FROM blog
        JOIN blogcategory as c ON c.blogCategory_id = blog.blogCategory_id
        LIMIT ? OFFSET ?
      `;
      countQuery = `
        SELECT COUNT(*) as total
        FROM blog
      `;
    }

    // Đếm tổng số bài viết
    connection.query(countQuery, (error, countResult) => {
      if (error) {
        console.log("Error fetching blog count ", error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }

      const totalItems = countResult[0].total;
      const totalPages = Math.ceil(totalItems / limitInt);

      // Lấy danh sách bài viết với phân trang
      connection.query(query, [limitInt, limitInt * (pageInt - 1)], (error, results) => {
        if (error) {
          console.log("Error fetching blog list ", error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'No data in database' });
        }
        return res.status(200).json({ listBlog: results, totalPages: totalPages });
      });
    });
  } catch (err) {
    console.log('Error fetching blog list ', err);
    return res.status(500).json({
      message: 'Internal Server Error'
    });
  }
});

export default router;
