import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData: any = await request.formData();
    const file = formData.get("photo") as File;
    if (!file) return Response.json({ error: "No photo provided" }, { status: 400 });

    const { url } = await put(`photos/${Date.now()}-${file.name}`, file, { access: "public" });
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
