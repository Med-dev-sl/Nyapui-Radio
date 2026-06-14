import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let rows;
    if (q) {
      [rows] = await db.execute(
        "SELECT id, name FROM presenters WHERE name LIKE ? ORDER BY name LIMIT 20",
        [`%${q}%`]
      );
    } else {
      [rows] = await db.execute(
        "SELECT id, name FROM presenters ORDER BY name"
      );
    }
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
