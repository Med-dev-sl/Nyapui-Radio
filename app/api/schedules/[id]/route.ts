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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { photo_url, scheduled_at, topic, guests, presenters } = await request.json();

    if (!scheduled_at) return Response.json({ error: "Date and time is required" }, { status: 400 });

    await db.execute(
      "UPDATE program_schedules SET photo_url = ?, scheduled_at = ?, topic = ? WHERE id = ?",
      [photo_url || "", scheduled_at, topic || null, id]
    );

    await db.execute("DELETE FROM schedule_guests WHERE schedule_id = ?", [id]);
    await db.execute("DELETE FROM schedule_presenters WHERE schedule_id = ?", [id]);

    if (Array.isArray(guests)) {
      for (const g of guests) {
        const guestId = await ensureGuest(g.name, g.position, g.institution);
        if (guestId) await db.execute("INSERT INTO schedule_guests (schedule_id, guest_id) VALUES (?, ?)", [id, guestId]);
      }
    }

    if (Array.isArray(presenters)) {
      for (const p of presenters) {
        const presenterId = await ensurePresenter(p.name);
        if (presenterId) await db.execute("INSERT INTO schedule_presenters (schedule_id, presenter_id) VALUES (?, ?)", [id, presenterId]);
      }
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.execute("DELETE FROM program_schedules WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
