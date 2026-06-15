import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url) });

const raw = process.env.DATABASE_URL || "";
let url = raw;
if (url.startsWith("mysql:mysql://")) url = url.replace("mysql:mysql://", "mysql://");
url = url.replace(/\?ssl-mode=REQUIRED/, "");

const parsed = new URL(url);

const mysql = (await import("mysql2/promise")).default;
const c = await mysql.createConnection({
  host: parsed.hostname,
  port: Number(parsed.port),
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: false },
  multipleStatements: true,
});

const sql = `
CREATE TABLE IF NOT EXISTS podcasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  audio_data LONGTEXT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS podcast_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  podcast_id INT NOT NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS podcast_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  podcast_id INT NOT NULL,
  commenter_name VARCHAR(255) DEFAULT 'Anonymous',
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);
`;

try {
  await c.query(sql);
  console.log("Tables created successfully.");
} catch (e) {
  console.error("Error:", e.message);
} finally {
  await c.end();
}
