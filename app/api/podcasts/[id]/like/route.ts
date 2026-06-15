import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows]: any = await db.execute("SELECT COUNT(*) AS count FROM podcast_likes WHERE podcast_id = ?", [id]);
    return Response.json({ count: rows[0].count });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { session_id } = await request.json();

    const [existing]: any = await db.execute("SELECT id FROM podcast_likes WHERE podcast_id = ? AND session_id = ?", [id, session_id]);

    if (existing.length > 0) {
      await db.execute("DELETE FROM podcast_likes WHERE podcast_id = ? AND session_id = ?", [id, session_id]);
      return Response.json({ liked: false });
    }

    await db.execute("INSERT INTO podcast_likes (podcast_id, session_id) VALUES (?, ?)", [id, session_id]);
    return Response.json({ liked: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
