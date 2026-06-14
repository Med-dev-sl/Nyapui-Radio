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
CREATE TABLE IF NOT EXISTS program_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photo_url VARCHAR(500) DEFAULT '',
  scheduled_at DATETIME NOT NULL,
  topic TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  guest_id INT NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_presenters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  presenter_id INT NOT NULL,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS schedule_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES program_schedules(id) ON DELETE CASCADE
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
