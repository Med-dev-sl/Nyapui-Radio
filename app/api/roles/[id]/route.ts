import { db } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description } = await request.json();

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    await db.execute(
      "UPDATE roles SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );

    return Response.json({ id: Number(id), name, description });
  } catch (e: any) {
    if (e.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "Role name already exists" }, { status: 409 });
    }
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.execute("DELETE FROM roles WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
