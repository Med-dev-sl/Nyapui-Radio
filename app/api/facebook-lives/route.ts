import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await db.execute(
      `SELECT f.id, f.facebook_url, f.topic, f.is_active, f.created_at,
              (SELECT COUNT(*) FROM live_likes WHERE live_id = f.id) AS like_count,
              (SELECT COUNT(*) FROM live_comments WHERE live_id = f.id) AS comment_count
       FROM facebook_lives f
       ORDER BY f.created_at DESC`
    );

    const result: any[] = [];
    for (const row of rows) {
      const [guests]: any = await db.execute(
        `SELECT g.id, g.name, g.position, g.institution
         FROM guests g
         JOIN live_guests lg ON g.id = lg.guest_id
         WHERE lg.live_id = ?
         ORDER BY lg.id`,
        [row.id]
      );
      const [presenters]: any = await db.execute(
        `SELECT p.id, p.name
         FROM presenters p
         JOIN live_presenters lp ON p.id = lp.presenter_id
         WHERE lp.live_id = ?
         ORDER BY lp.id`,
        [row.id]
      );
      result.push({ ...row, guests, presenters });
    }

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

async function ensureGuest(name: string, position: string, institution: string) {
  if (!name) return null;
  await db.execute(
    "INSERT IGNORE INTO guests (name, position, institution) VALUES (?, ?, ?)",
    [name, position || "", institution || ""]
  );
  const [rows]: any = await db.execute(
    "SELECT id FROM guests WHERE name = ?",
    [name]
  );
  return rows[0]?.id || null;
}

async function ensurePresenter(name: string) {
  if (!name) return null;
  await db.execute(
    "INSERT IGNORE INTO presenters (name) VALUES (?)",
    [name]
  );
  const [rows]: any = await db.execute(
    "SELECT id FROM presenters WHERE name = ?",
    [name]
  );
  return rows[0]?.id || null;
}

export async function POST(request: Request) {
  try {
    const { facebook_url, topic, guests, presenters } = await request.json();

    if (!facebook_url) {
      return Response.json({ error: "Facebook URL is required" }, { status: 400 });
    }

    const [result]: any = await db.execute(
      "INSERT INTO facebook_lives (facebook_url, topic) VALUES (?, ?)",
      [facebook_url, topic || null]
    );

    const liveId = result.insertId;

    if (Array.isArray(guests)) {
      for (const g of guests) {
        const guestId = await ensureGuest(g.name, g.position, g.institution);
        if (guestId) {
          await db.execute(
            "INSERT INTO live_guests (live_id, guest_id) VALUES (?, ?)",
            [liveId, guestId]
          );
        }
      }
    }

    if (Array.isArray(presenters)) {
      for (const p of presenters) {
        const presenterId = await ensurePresenter(p.name);
        if (presenterId) {
          await db.execute(
            "INSERT INTO live_presenters (live_id, presenter_id) VALUES (?, ?)",
            [liveId, presenterId]
          );
        }
      }
    }

    return Response.json({ id: liveId }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
