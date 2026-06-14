import mysql from "mysql2/promise";

function getConfig() {
  const raw = process.env.DATABASE_URL || "";
  let cleaned = raw;
  if (cleaned.startsWith("mysql:mysql://")) cleaned = cleaned.replace("mysql:mysql://", "mysql://");
  cleaned = cleaned.replace(/\?ssl-mode=REQUIRED/, "");
  const url = new URL(cleaned);
  return {
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: false },
  };
}

export const db = mysql.createPool(getConfig());
