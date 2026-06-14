import { db } from "@/lib/db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { facebook_url, topic, guest_name, guest_position, guest_institution, presenter_name } = await request.json();

    if (!facebook_url) {
      return Response.json({ error: "Facebook URL is required" }, { status: 400 });
    }

    await db.execute(
      `UPDATE facebook_lives SET facebook_url = ?, topic = ?, guest_name = ?, guest_position = ?, guest_institution = ?, presenter_name = ? WHERE id = ?`,
      [facebook_url, topic || null, guest_name || "", guest_position || "", guest_institution || "", presenter_name || "", id]
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
