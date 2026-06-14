import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Username and password required" }, { status: 400 });
    }

    const [rows]: any = await db.execute(
      `SELECT u.id, u.username, u.password, u.full_name, u.is_active, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = ? AND u.is_active = TRUE`,
      [username]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { password: _, ...safeUser } = user;
    return Response.json({ user: safeUser });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
