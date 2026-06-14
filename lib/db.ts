import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL || "";
const cleanUrl = url.replace(/\?ssl-mode=REQUIRED/, "");

export const db = mysql.createPool({
  uri: cleanUrl,
  ssl: {},
});
