import { put, del, list } from "@vercel/blob";

export async function uploadVideo(file: File, name: string) {
  return put(name, file, { access: "public" });
}

export async function deleteVideo(url: string) {
  return del(url);
}

export async function listVideos() {
  return list();
}
