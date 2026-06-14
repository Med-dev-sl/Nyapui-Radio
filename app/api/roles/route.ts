import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute("SELECT id, name, description FROM roles ORDER BY id");
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
