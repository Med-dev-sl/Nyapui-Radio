import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute("SELECT 1 AS ok");
    return Response.json({ status: "ok", db: rows });
  } catch (e) {
    return Response.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
