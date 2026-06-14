import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.execute(
      `SELECT f.id, f.facebook_url, f.guest_name, f.guest_position, f.guest_institution,
              f.presenter_name, f.is_active, f.created_at,
              (SELECT COUNT(*) FROM live_likes WHERE live_id = f.id) AS like_count,
              (SELECT COUNT(*) FROM live_comments WHERE live_id = f.id) AS comment_count
       FROM facebook_lives f
       ORDER BY f.created_at DESC`
    );
    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { facebook_url, guest_name, guest_position, guest_institution, presenter_name } = await request.json();

    if (!facebook_url) {
      return Response.json({ error: "Facebook URL is required" }, { status: 400 });
    }

    const [result]: any = await db.execute(
      `INSERT INTO facebook_lives (facebook_url, guest_name, guest_position, guest_institution, presenter_name)
       VALUES (?, ?, ?, ?, ?)`,
      [facebook_url, guest_name || "", guest_position || "", guest_institution || "", presenter_name || ""]
    );

    if (guest_name) {
      await db.execute(
        "INSERT IGNORE INTO guests (name, position, institution) VALUES (?, ?, ?)",
        [guest_name, guest_position || "", guest_institution || ""]
      );
    }

    if (presenter_name) {
      await db.execute(
        "INSERT IGNORE INTO presenters (name) VALUES (?)",
        [presenter_name]
      );
    }

    return Response.json({ id: result.insertId }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
