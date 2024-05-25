import { Router, query } from "express";
import connection from "../database.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";
import { LIMITMEDICINE } from "../config.js";


const router = Router();

// medicine theo category detail, giá , bán chạy , đánh giá cao nhất
router.get("/list-medicine", async (req, res) => {
  const { price, categoryDetail_id, medicine_id, limit } = req.query;

  // Convert query parameters to integers if they exist
  const categoryDetailId = categoryDetail_id ? parseInt(categoryDetail_id, 10) : null;
  const medicineId = medicine_id ? parseInt(medicine_id, 10) : null;
  const limitInt = limit ? parseInt(limit, 10) : LIMITMEDICINE; // Default limit value if not provided

  // Determine which query to run based on the query parameters
  let query;
  let queryParams;
  // Recommend medicines
  if (categoryDetailId && medicineId !== null && limitInt !== null) {
    query = `
      SELECT medicine_id, medicineName, price, soldMedicine, likeMedicine
      FROM medicine
      WHERE categoryDetail_id = ? AND status = 'available' AND medicine_id != ?
      LIMIT ?
    `;
    queryParams = [categoryDetailId, medicineId, limitInt];
  } else if (categoryDetailId && medicineId === 0 && limitInt === 0) {
    query = `
      SELECT medicine_id, medicineName, price, soldMedicine, likeMedicine
      FROM medicine
      WHERE categoryDetail_id = ? AND status = 'available'
    `;
    queryParams = [categoryDetailId];
  } else if (price) {
    query = `
      SELECT medicine_id, medicineName, price, soldMedicine, likeMedicine
      FROM medicine
      WHERE price >= ? AND status = 'available'
      LIMIT ?
    `;
    queryParams = [price, limitInt];
  } else {
    query = `
      SELECT medicine_id, medicineName, price, soldMedicine, likeMedicine
      FROM medicine
      WHERE status = 'available'
      LIMIT ?
    `;
    queryParams = [limitInt];
  }

  // Execute the query
  connection.query(query, queryParams, (error, result) => {
    if (error) {
      console.log("Error fetching medicine list ", error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'No data in database' });
    }
    return res.status(200).json({ listMedicine: result });
  });
});


// ! Lấy thông tin sản phẩm chi tiết
// Lấy tên , danh mục thương hiệu tiền , like sold công cụng nhàn sản xuất , quy cách , lưu ý , xuất sứ thương hiệu 
// CategoryDetail Name
router.get('/medicine', async (req, res) => {
    try {
        const { medicineId } = req.query;
        if (medicineId) {
            const query = `
            SELECT 
                md.medicineName as name, 
                md.medicine_id,
                b.brandName,
                md.soldMedicine as sold, 
                md.likeMedicine as 'like',
                md.usesMedicine as uses, 
                md.specificationMedicine as spec, 
                md.price,
                p.companyName as producerName, 
                p.phoneNumber as producerPhone, 
                p.address as producerAddress, 
                p.website as producerWebsite, 
                d.companyName as distributorName, 
                d.phoneNumber as distributorPhone,
                d.address as distributorAddress, 
                d.website as distributorWebsite,
                c.categoryDetail_id,
                c.categoryDetailName as categoryName
            FROM 
                medicine as md
            JOIN 
                brand as b ON b.brand_id = md.brand_id
            JOIN 
                distributor as d ON d.distributor_id = md.distributor_id
            JOIN 
                producer as p ON p.producer_id = md.producer_id
            JOIN 
                categoryDetail as c ON c.categoryDetail_id = md.categoryDetail_id
            WHERE 
                md.medicine_id = ? 
                AND md.status = 'available';
        `;

            connection.query(query, [medicineId], (error, result) => {
                if (error) {
                    console.log('Error fetching medicine ', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }
                if (result.length === 0) {
                    return res.status(404).json({ message: `Not found medicine with id ${medicineId}` });
                }
                return res.status(200).json({
                    medicine: result[0]
                });
            });

            return; // Add return here to prevent sending multiple responses
        }
        return res.status(404).json({ message: 'Id not found' });
    } catch (err) {
        console.log('Error fetching medicine ', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;