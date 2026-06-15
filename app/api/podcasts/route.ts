import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.execute(
      `SELECT p.id, p.title, p.description, p.is_active, p.created_at,
              (SELECT COUNT(*) FROM podcast_likes WHERE podcast_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM podcast_comments WHERE podcast_id = p.id) AS comment_count
       FROM podcasts p ORDER BY p.created_at DESC`
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { audio_data, title, description } = await request.json();

    if (!title) return Response.json({ error: "Title is required" }, { status: 400 });

    const [result]: any = await db.execute(
      "INSERT INTO podcasts (audio_data, title, description) VALUES (?, ?, ?)",
      [audio_data || null, title, description || null]
    );

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
