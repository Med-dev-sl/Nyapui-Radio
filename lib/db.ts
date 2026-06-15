import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getConfig() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL environment variable is not set");

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

function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(getConfig());
  }
  return pool;
}

export const db = new Proxy({} as mysql.Pool, {
  get(_, prop: string) {
    return (getPool() as any)[prop];
  },
});
