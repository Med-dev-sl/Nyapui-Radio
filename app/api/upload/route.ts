import { uploadVideo } from "@/lib/blob";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData: any = await request.formData();
    const file = formData.get("video") as File;

    if (!file) {
      return Response.json({ error: "No video file provided" }, { status: 400 });
    }

    const { url } = await uploadVideo(file, `videos/${Date.now()}-${file.name}`);

    await db.execute(
      "INSERT INTO videos (url, name, size) VALUES (?, ?, ?)",
      [url, file.name, file.size]
    );

    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
