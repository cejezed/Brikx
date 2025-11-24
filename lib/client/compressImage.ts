// lib/client/compressImage.ts
// ✅ v3.13: Client-side image compressie voor moodboard uploads
// Comprimeert afbeeldingen naar max 1600px breed en ~500KB

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.8,
  mimeType: "image/jpeg",
};

/**
 * Comprimeert een afbeelding client-side
 * @param file - Het originele File object
 * @param options - Compressie opties
 * @returns Promise met gecomprimeerde blob en metadata
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Canvas 2D context niet beschikbaar"));
      return;
    }

    img.onload = () => {
      // Bereken nieuwe dimensies met behoud van aspect ratio
      let { width, height } = img;

      if (width > opts.maxWidth) {
        height = Math.round((height * opts.maxWidth) / width);
        width = opts.maxWidth;
      }

      if (height > opts.maxHeight) {
        width = Math.round((width * opts.maxHeight) / height);
        height = opts.maxHeight;
      }

      // Stel canvas dimensies in
      canvas.width = width;
      canvas.height = height;

      // Teken afbeelding op canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Converteer naar blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Kon afbeelding niet comprimeren"));
            return;
          }

          resolve({
            blob,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
          });
        },
        opts.mimeType,
        opts.quality
      );
    };

    img.onerror = () => {
      reject(new Error("Kon afbeelding niet laden"));
    };

    // Laad afbeelding van file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Kon bestand niet lezen"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Valideert of een file een ondersteund afbeeldingsformaat is
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  return validTypes.includes(file.type);
}

/**
 * Formatteert bestandsgrootte naar leesbare string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Genereert een unieke bestandsnaam voor upload
 */
export function generateUniqueFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const uuid = crypto.randomUUID();
  return `${uuid}.${ext}`;
}
