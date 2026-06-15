import { db } from "@/lib/db";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id: string = (await params).id;
    await db.execute("UPDATE podcasts SET is_active = NOT is_active WHERE id = ?", [id]);
    const [rows]: any = await db.execute("SELECT id, is_active FROM podcasts WHERE id = ?", [id]);
    return Response.json(rows[0]);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
