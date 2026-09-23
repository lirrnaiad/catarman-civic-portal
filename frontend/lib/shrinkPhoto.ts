/**
 * Downscales a phone photo before upload: longest side 1600px, JPEG 0.8.
 * A 4-8MB camera shot becomes a few hundred KB, which keeps a whole report
 * (and its base64 copy in the offline queue) well under the 10MB request cap
 * that Next's proxy puts on /api/reports, and each photo row under small
 * MySQL packet limits. Falls back to the original file if the browser can't
 * decode it (e.g. HEIC outside Safari).
 */
const MAX_SIDE = 1600;
const QUALITY = 0.8;

export async function shrinkPhoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
  } catch {
    return file;
  }
}
