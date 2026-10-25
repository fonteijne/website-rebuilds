// Verkleint een foto in de browser voordat hij naar de server gaat: sneller uploaden,
// goedkoper voor het model en ruim onder de bodylimiet van Vercel (4,5 MB).

const MAX_SIDE = 1800;
const QUALITY = 0.82;

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close?: () => void }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    // Oudere Safari: via een <img>.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

export async function resizeImage(file: File): Promise<string> {
  let decoded;
  try {
    decoded = await decode(file);
  } catch {
    throw new Error("Deze foto kan ik niet openen. Probeer een JPG of PNG, of maak een screenshot ervan.");
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(decoded.width, decoded.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(decoded.width * scale);
  canvas.height = Math.round(decoded.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Je browser kan deze foto niet verwerken.");
  ctx.drawImage(decoded.source, 0, 0, canvas.width, canvas.height);
  decoded.close?.();
  return canvas.toDataURL("image/jpeg", QUALITY);
}
