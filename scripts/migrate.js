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

  // Fix duplicate prefix and strip ssl-mode (mysql2 doesn't support it)
  let cleanUrl = dbUrl.replace(/^mysql:/, ""); // remove accidental mysql: prefix
  if (!cleanUrl.startsWith("mysql://")) cleanUrl = "mysql://" + cleanUrl;
  cleanUrl = cleanUrl.replace(/\?ssl-mode=REQUIRED/, "");
  console.log("Connecting to:", cleanUrl.replace(/\/\/.*@/, "//***@"));

  const connection = await mysql.createConnection({
    uri: cleanUrl,
    ssl: {},
  });

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
