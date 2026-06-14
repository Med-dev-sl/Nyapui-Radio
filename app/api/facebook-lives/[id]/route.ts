import { db } from "@/lib/db";

async function ensureGuest(name: string, position: string, institution: string) {
  if (!name) return null;
  await db.execute(
    "INSERT IGNORE INTO guests (name, position, institution) VALUES (?, ?, ?)",
    [name, position || "", institution || ""]
  );
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
    const { facebook_url, topic, guests, presenters } = await request.json();

    if (!facebook_url) {
      return Response.json({ error: "Facebook URL is required" }, { status: 400 });
    }

    await db.execute(
      "UPDATE facebook_lives SET facebook_url = ?, topic = ? WHERE id = ?",
      [facebook_url, topic || null, id]
    );

    await db.execute("DELETE FROM live_guests WHERE live_id = ?", [id]);
    await db.execute("DELETE FROM live_presenters WHERE live_id = ?", [id]);

    if (Array.isArray(guests)) {
      for (const g of guests) {
        const guestId = await ensureGuest(g.name, g.position, g.institution);
        if (guestId) {
          await db.execute("INSERT INTO live_guests (live_id, guest_id) VALUES (?, ?)", [id, guestId]);
        }
      }
    }

    if (Array.isArray(presenters)) {
      for (const p of presenters) {
        const presenterId = await ensurePresenter(p.name);
        if (presenterId) {
          await db.execute("INSERT INTO live_presenters (live_id, presenter_id) VALUES (?, ?)", [id, presenterId]);
        }
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
    await db.execute("DELETE FROM facebook_lives WHERE id = ?", [id]);
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
