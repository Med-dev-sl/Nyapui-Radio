import { db } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { session_id } = await request.json();

    const [existing]: any = await db.execute(
      "SELECT id FROM schedule_reminders WHERE schedule_id = ? AND session_id = ?",
      [id, session_id]
    );

    if (existing.length > 0) {
      await db.execute("DELETE FROM schedule_reminders WHERE schedule_id = ? AND session_id = ?", [id, session_id]);
      return Response.json({ reminded: false });
    }

    await db.execute("INSERT INTO schedule_reminders (schedule_id, session_id) VALUES (?, ?)", [id, session_id]);
    return Response.json({ reminded: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
