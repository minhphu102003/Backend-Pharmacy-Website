import express, { query } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import connection from "../database.js";
import multer from 'multer';
import { authenticateAdmin,authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); 
// 
router.get("/current-user", async (req, res) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];

    // Giải mã accessToken để lấy thông tin người dùng
    const decodedToken = jwt.verify(accessToken, JWT_SECRET);
    const query = `
            SELECT user.user_id, user.email, user.role_id, user.username, user.phoneNumber, user.avatar, role.role as role_name, user.dob
            FROM user 
            JOIN role ON user.role_id = role.id 
            WHERE user.user_id = ?
        `;

    connection.query(query, [decodedToken.id], (error, results) => {
      if (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(results);
      const user = results[0];
      res.status(200).json(user);
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const { searchByRole, page, limit } = req.query;
    if (!page || !limit) {
      const query = `
            SELECT u.username, u.user_id, u.email, u.phoneNumber, r.id, r.role
            FROM user u
            JOIN role r ON u.role_id = r.id
            WHERE r.role = ?
        `;
      connection.query(query, [searchByRole], (error, results) => {
        if (error) {
          console.error("Error fetching user list:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        const objectResult = {
          listUsers: results,
          totalPages: Math.ceil(results.length / 10),
        };

        res.status(200).json(objectResult);
      });
    } else {
      const pageInt = parseInt(page, 10);
      const limitInt = parseInt(limit, 10);
      const offset = limitInt * (pageInt - 1);

      const query = `
                SELECT u.username, u.user_id, u.email, u.phoneNumber, r.id, r.role
                FROM user u
                JOIN role r ON u.role_id = r.id
                WHERE r.role = ?
                LIMIT ? OFFSET ?
            `;
      connection.query(
        query,
        [searchByRole, limitInt, offset],
        (error, results) => {
          if (error) {
            console.error("Error fetching user list:", error);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          const countQuery = `
                    SELECT COUNT(*) as total
                    FROM user u
                    JOIN role r ON u.role_id = r.id
                    WHERE r.role = ?
                `;
          connection.query(
            countQuery,
            [searchByRole],
            (countError, countResults) => {
              if (countError) {
                console.error("Error fetching total user count:", countError);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }

              const totalUsers = countResults[0].total;
              const totalPages = Math.ceil(totalUsers / limitInt);

              const objectResult = {
                listUsers: results,
                totalPages: totalPages,
              };

              res.status(200).json(objectResult);
            }
          );
        }
      );
    }
  } catch (err) {
    console.error("Error fetching user list:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/update-user", authenticateAdmin, async (req, res) => {
  const { userId, role } = req.query;
  if (!userId || !role) {
    return res.status(400).json({ message: "Missing userId or role" });
  }
  const query = `
        UPDATE USER
        SET role_id = ?
        WHERE user_id = ?
    `;
  connection.query(query, [role, userId], (error, result) => {
    if (error) {
      console.log("Error update role ", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User role updated successfully" });
  });
});

router.delete("/delete-user/:userId", authenticateAdmin, async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  const querySelectUser = `
    SELECT * FROM user WHERE user_id = ?
    `;
  connection.query(querySelectUser, [userId], (errorSelectUser, userDelete) => {
    if (errorSelectUser) {
      console.log("Error fetching user:", errorSelectUser);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    console.log(userDelete);
    if (userDelete.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const queryDeleteUser = `
        DELETE FROM user WHERE user_id = ?
    `;
    connection.query(queryDeleteUser, [userId], (errorDeleteUser, result) => {
      if (errorDeleteUser) {
        console.log("Error deleting user:", errorDeleteUser);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      return res
        .status(200)
        .json({ user: userDelete[0], message: "User deleted successfully" });
    });
  });
});


router.put('/edit-profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  const user_id = req.user;
  const { oldPassword, newPassword, username, phone, gender, dob } = req.body;
  const avatar = req.file;

  try {
    if (oldPassword && newPassword) {
      const query = `
        SELECT password 
        FROM user 
        WHERE user_id = ?
      `;
      connection.query(query, [user_id], async (error, results) => {
        if (error) {
          console.log('Error fetching change password:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        const user = results[0];
        // Assuming plain text password comparison for now
        const passwordMatch = (oldPassword === user.password);
        if (!passwordMatch) {
          return res.status(400).json({ message: 'Old Password Was Incorrect!' });
        }

        const updateQuery = `
          UPDATE user 
          SET password = ? 
          WHERE user_id = ?
        `;
        connection.query(updateQuery, [newPassword, user_id], (updateError, updateResult) => {
          if (updateError) {
            console.log('Error updating password:', updateError);
            return res.status(500).json({ message: 'Internal Server Error' });
          }
          return res.status(200).json({ message: 'Password updated successfully' });
        });
      });
    } else if (username && phone && gender && dob) {
      let updateQuery, queryParams;
      if (avatar) {
        console.log(avatar);
        const avatarPath = avatar.path;
        updateQuery = `
          UPDATE user 
          SET username = ?, phoneNumber = ?, gender = ?, dob = ?, avatar = ?
          WHERE user_id = ?
        `;
        queryParams = [username, phone, gender, dob, avatarPath, user_id];
      } else {
        updateQuery = `
          UPDATE user 
          SET username = ?, phoneNumber = ?, gender = ?, dob = ?
          WHERE user_id = ?
        `;
        queryParams = [username, phone, gender, dob, user_id];
      }
      connection.query(updateQuery, queryParams, (error, result) => {
        if (error) {
          console.error('Error updating profile:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Profile updated successfully' });
      });
    } else {
      res.status(400).json({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error in edit-profile route:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
