import mysql from "mysql2/promise"


const pool = mysql.createPool({
  
      host: process.env.DB_HOST,     // Database host
      user: process.env.DB_USER, // Database username
      password: process.env.DB_PASSWORD, // Database password
      database: process.env.DB_NAME, // Database name
      waitForConnections: true
  });

 

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params); // Execute query with parameters
  return rows; // Return the query results
}; 

export default pool; 
