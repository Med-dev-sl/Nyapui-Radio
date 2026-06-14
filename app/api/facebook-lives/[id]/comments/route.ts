import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows] = await db.execute(
      "SELECT id, commenter_name, comment_text, created_at FROM live_comments WHERE live_id = ? ORDER BY created_at DESC",
      [id]
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { commenter_name, comment_text } = await request.json();

    if (!comment_text) {
      return Response.json({ error: "Comment text is required" }, { status: 400 });
    }

    const [result]: any = await db.execute(
      "INSERT INTO live_comments (live_id, commenter_name, comment_text) VALUES (?, ?, ?)",
      [id, commenter_name || "Anonymous", comment_text]
    );

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
