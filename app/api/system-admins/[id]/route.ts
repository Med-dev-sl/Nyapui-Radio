import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { username, password, email, full_name, role_id } = await request.json();

    if (!username || !full_name || !role_id) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      await db.execute(
        "UPDATE users SET username = ?, password = ?, email = ?, full_name = ?, role_id = ? WHERE id = ?",
        [username, hashed, email || null, full_name, Number(role_id), id]
      );
    } else {
      await db.execute(
        "UPDATE users SET username = ?, email = ?, full_name = ?, role_id = ? WHERE id = ?",
        [username, email || null, full_name, Number(role_id), id]
      );
    }

    return Response.json({ success: true });
  } catch (e: any) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Username or email already exists" }, { status: 409 });
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
