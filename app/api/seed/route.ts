import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const [existing]: any = await db.execute("SELECT COUNT(*) AS count FROM users");
    if (existing[0].count > 0) {
      return Response.json({ message: "Already seeded" });
    }

    const hashed = await bcrypt.hash("admin123", 12);
    await db.execute(
      "INSERT INTO users (username, password, email, full_name, role_id) VALUES (?, ?, ?, ?, ?)",
      ["superadmin", hashed, "admin@nyapuiradio.com", "Super Admin", 1]
    );

    return Response.json({ message: "Seeded: superadmin / admin123" });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
