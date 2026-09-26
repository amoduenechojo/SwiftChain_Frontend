import imageCompression from 'browser-image-compression';

/**
 * imageCompressionService -- wraps `browser-image-compression` to provide
 * a retrying compression API that strictly guarantees a maximum size in KB.
 *
 * Strategy: the library's own `maxSizeMB` option is a best-effort target,
 * not a guarantee, so this layers two escalating fallbacks on top of it:
 *   1. Progressive JPEG quality reduction (0.8 -> 0.2).
 *   2. Progressive max-dimension downscaling (1280 -> 320), re-running the
 *      quality sweep at each dimension step.
 * This keeps the output strictly under the target for realistic delivery
 * proof photos while preserving as much readability as possible.
 */

const QUALITY_STEPS = [0.8, 0.65, 0.5, 0.35, 0.2];
const DIMENSION_STEPS = [1280, 1024, 800, 640, 480, 320];

function toFile(blob: Blob, original: File): File {
  const mime = (blob as any).type || original.type;
  return new File([blob], original.name, { type: mime });
}

export const imageCompressionService = {
  /**
   * Compress a File to target size (KB). Returns a new File instance.
   * Throws if the target cannot be met even at the smallest acceptable
   * dimension/quality, so callers never silently upload an oversized file.
   */
  async compressImage(file: File, targetSizeKB = 500): Promise<File> {
    const targetBytes = targetSizeKB * 1024;

    let bestBlob: Blob | null = null;

    for (const maxWidthOrHeight of DIMENSION_STEPS) {
      for (const initialQuality of QUALITY_STEPS) {
        const options: Record<string, any> = {
          maxSizeMB: targetSizeKB / 1024,
          maxWidthOrHeight,
          initialQuality,
          useWebWorker: true,
        };

        const blob: Blob = await imageCompression(file as any, options);

        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }

        if (blob.size <= targetBytes) {
          return toFile(blob, file);
        }
      }
    }

    if (bestBlob) {
      throw new Error(
        `Unable to compress "${file.name}" below ${targetSizeKB}KB (smallest achievable was ${(
          bestBlob.size / 1024
        ).toFixed(2)}KB). Try a lower-resolution source image.`
      );
    }

    throw new Error(`Failed to compress "${file.name}".`);
  },
};
