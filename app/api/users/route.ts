import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.username, u.email, u.full_name, u.is_active, u.created_at, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, password, email, full_name, role_id } = await request.json();

    if (!username || !password || !full_name || !role_id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const [result]: any = await db.execute(
      "INSERT INTO users (username, password, email, full_name, role_id) VALUES (?, ?, ?, ?, ?)",
      [username, hashed, email || null, full_name, role_id]
    );

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
