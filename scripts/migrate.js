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

  const connection = await mysql.createConnection(dbUrl);
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
  console.error("Migration failed:", err.message);
  process.exit(1);
});
