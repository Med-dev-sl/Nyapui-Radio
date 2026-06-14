import mysql from "mysql2/promise";

function getConfig() {
  const raw = process.env.DATABASE_URL || "";
  const cleaned = raw.replace(/^mysql:/, "").replace(/\?ssl-mode=REQUIRED/, "");
  const url = new URL(cleaned);
  return {
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: {},
  };
}

export const db = mysql.createPool(getConfig());
