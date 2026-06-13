import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`;
    return Response.json({ status: "ok", time: result[0].now });
  } catch (e) {
    return Response.json({ status: "error", message: String(e) }, { status: 500 });
  }
}
