import { db } from "@/lib/db";

async function ensureGuest(name: string, position: string, institution: string) {
  if (!name) return null;
  await db.execute("INSERT IGNORE INTO guests (name, position, institution) VALUES (?, ?, ?)", [name, position || "", institution || ""]);
  const [rows]: any = await db.execute("SELECT id FROM guests WHERE name = ?", [name]);
  return rows[0]?.id || null;
}

async function ensurePresenter(name: string) {
  if (!name) return null;
  await db.execute("INSERT IGNORE INTO presenters (name) VALUES (?)", [name]);
  const [rows]: any = await db.execute("SELECT id FROM presenters WHERE name = ?", [name]);
  return rows[0]?.id || null;
}

export async function GET() {
  try {
    const [rows]: any = await db.execute(
      `SELECT s.id, s.photo_url, s.scheduled_at, s.topic, s.is_active, s.created_at,
              (SELECT COUNT(*) FROM schedule_reminders WHERE schedule_id = s.id) AS remind_count
       FROM program_schedules s ORDER BY s.scheduled_at DESC`
    );

    const result: any[] = [];
    for (const row of rows) {
      const [guests]: any = await db.execute(
        "SELECT g.id, g.name, g.position, g.institution FROM guests g JOIN schedule_guests sg ON g.id = sg.guest_id WHERE sg.schedule_id = ? ORDER BY sg.id",
        [row.id]
      );
      const [presenters]: any = await db.execute(
        "SELECT p.id, p.name FROM presenters p JOIN schedule_presenters sp ON p.id = sp.presenter_id WHERE sp.schedule_id = ? ORDER BY sp.id",
        [row.id]
      );
      result.push({ ...row, guests, presenters });
    }

    return Response.json(result);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { photo_url, scheduled_at, topic, guests, presenters } = await request.json();

    if (!scheduled_at) return Response.json({ error: "Date and time is required" }, { status: 400 });

    const [result]: any = await db.execute(
      "INSERT INTO program_schedules (photo_url, scheduled_at, topic) VALUES (?, ?, ?)",
      [photo_url || "", scheduled_at, topic || null]
    );

    const scheduleId = result.insertId;

    if (Array.isArray(guests)) {
      for (const g of guests) {
        const guestId = await ensureGuest(g.name, g.position, g.institution);
        if (guestId) await db.execute("INSERT INTO schedule_guests (schedule_id, guest_id) VALUES (?, ?)", [scheduleId, guestId]);
      }
    }

    if (Array.isArray(presenters)) {
      for (const p of presenters) {
        const presenterId = await ensurePresenter(p.name);
        if (presenterId) await db.execute("INSERT INTO schedule_presenters (schedule_id, presenter_id) VALUES (?, ?)", [scheduleId, presenterId]);
      }
    }

    return Response.json({ id: scheduleId }, { status: 201 });
  } catch (e: any) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
