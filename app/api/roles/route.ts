import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute("SELECT id, name, description FROM roles ORDER BY id");
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    const [result]: any = await db.execute(
      "INSERT INTO roles (name, description) VALUES (?, ?)",
      [name, description || null]
    );
    return Response.json({ id: result.insertId, name, description }, { status: 201 });
  } catch (e: any) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Role name already exists" }, { status: 409 });
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
