import { db } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    const { audio_data, title, description } = await request.json();

    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    const hasAudio = audio_data && audio_data.startsWith("data:");
    const sql = hasAudio
      ? "UPDATE podcasts SET audio_data = ?, title = ?, description = ? WHERE id = ?"
      : "UPDATE podcasts SET title = ?, description = ? WHERE id = ?";
    const sqlParams = hasAudio
      ? [audio_data, title, description || null, id]
      : [title, description || null, id];

    await db.execute(sql, sqlParams);

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    const [rows]: any = await db.execute(
      "SELECT id, audio_data, title, description, is_active, created_at FROM podcasts WHERE id = ?",
      [id]
    );
    if (!rows[0]) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(rows[0]);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    await db.execute("DELETE FROM podcasts WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
