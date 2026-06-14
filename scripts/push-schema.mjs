import mysql from "mysql2/promise";
import { config } from "dotenv";

config({ path: new URL("../.env.local", import.meta.url) });

const raw = process.env.DATABASE_URL || "";
let url = raw;
if (url.startsWith("mysql:mysql://")) url = url.replace("mysql:mysql://", "mysql://");
url = url.replace(/\?ssl-mode=REQUIRED/, "");

const parsed = new URL(url);

const conn = await mysql.createConnection({
  host: parsed.hostname,
  port: Number(parsed.port),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
  multipleStatements: true,
});

const tables = [
  `CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    position VARCHAR(255) DEFAULT '',
    institution VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS presenters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS facebook_lives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facebook_url VARCHAR(500) NOT NULL,
    guest_name VARCHAR(255) DEFAULT '',
    guest_position VARCHAR(255) DEFAULT '',
    guest_institution VARCHAR(255) DEFAULT '',
    presenter_name VARCHAR(255) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS live_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    live_id INT NOT NULL,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS live_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    live_id INT NOT NULL,
    commenter_name VARCHAR(255) DEFAULT 'Anonymous',
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (live_id) REFERENCES facebook_lives(id) ON DELETE CASCADE
  )`,
];

try {
  for (const sql of tables) {
    await conn.query(sql);
  }
  console.log("New tables created successfully.");
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await conn.end();
}
