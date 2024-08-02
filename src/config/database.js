import mysql2 from "mysql2";
import { PASSWORD,USER,DATABASE,HOST } from "../config.js";

const connection = mysql2.createConnection({
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE
});

connection.connect(error => {
    if (error) throw error;
    console.log('Successfully connected to the database.');
});

export default connection;