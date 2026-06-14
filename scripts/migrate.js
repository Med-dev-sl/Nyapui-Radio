require("dotenv").config({ path: ".env.local" });
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function migrate() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }

  // Parse URL manually
  const cleaned = dbUrl.replace(/^mysql:/, "").replace(/\?ssl-mode=REQUIRED/, "");
  const url = new URL(cleaned);

  console.log("Connecting to:", url.host);

  const connection = await mysql.createConnection({
    host: url.hostname,
    port: Number(url.port),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: {},
  });

  console.log("Connected.\n");

  const sql = fs.readFileSync(
    path.join(__dirname, "..", "schema.sql"),
    "utf-8"
  );

  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    await connection.execute(stmt);
    console.log(`OK: ${stmt.slice(0, 60)}...`);
  }

  console.log("\nMigration complete.");
  await connection.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
