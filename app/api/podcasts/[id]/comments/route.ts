import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    const [rows] = await db.execute(
      "SELECT id, commenter_name, comment_text, created_at FROM podcast_comments WHERE podcast_id = ? ORDER BY created_at DESC",
      [id]
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    const { commenter_name, comment_text } = await request.json();

    if (!comment_text) return Response.json({ error: "Comment text is required" }, { status: 400 });

    const [result]: any = await db.execute(
      "INSERT INTO podcast_comments (podcast_id, commenter_name, comment_text) VALUES (?, ?, ?)",
      [id, commenter_name || "Anonymous", comment_text]
    );

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
