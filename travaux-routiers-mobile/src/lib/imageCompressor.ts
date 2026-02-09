/**
 * Utilitaire de compression d'images pour réduire la taille des photos
 * avant de les stocker dans Firestore (limite ~1 Mo par document).
 *
 * - Redimensionne l'image à une taille max (800px par défaut)
 * - Compresse en JPEG avec une qualité réduite
 * - Retourne un DataURL base64 beaucoup plus léger
 */

export interface CompressOptions {
  /** Largeur/hauteur maximale en pixels (défaut: 800) */
  maxSize?: number;
  /** Qualité JPEG entre 0 et 1 (défaut: 0.6) */
  quality?: number;
  /** Type MIME de sortie (défaut: image/jpeg) */
  mimeType?: string;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxSize: 800,
  quality: 0.6,
  mimeType: 'image/jpeg',
};

/**
 * Charge un DataURL dans un HTMLImageElement.
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Impossible de charger l'image: ${err}`));
    img.src = dataUrl;
  });
}

/**
 * Compresse un DataURL d'image et retourne un DataURL plus léger.
 *
 * Exemple :
 *   const compressed = await compressImage(dataUrl, { maxSize: 800, quality: 0.6 });
 *   // 3 Mo → ~80-150 Ko
 */
export async function compressImage(
  dataUrl: string,
  options?: CompressOptions,
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const img = await loadImage(dataUrl);

  // Calculer les nouvelles dimensions en gardant le ratio
  let { width, height } = img;
  if (width > opts.maxSize || height > opts.maxSize) {
    if (width > height) {
      height = Math.round((height * opts.maxSize) / width);
      width = opts.maxSize;
    } else {
      width = Math.round((width * opts.maxSize) / height);
      height = opts.maxSize;
    }
  }

  // Dessiner sur un canvas redimensionné
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D non supporté');

  ctx.drawImage(img, 0, 0, width, height);

  // Exporter en JPEG compressé
  const compressed = canvas.toDataURL(opts.mimeType, opts.quality);

  console.info(
    `[compressImage] ${(dataUrl.length / 1024).toFixed(0)} Ko → ${(compressed.length / 1024).toFixed(0)} Ko ` +
    `(${img.naturalWidth}x${img.naturalHeight} → ${width}x${height}, quality=${opts.quality})`,
  );

  return compressed;
}

/**
 * Compresse un tableau de DataURLs en parallèle.
 */
export async function compressImages(
  dataUrls: string[],
  options?: CompressOptions,
): Promise<string[]> {
  return Promise.all(dataUrls.map((url) => compressImage(url, options)));
}

/**
 * Retourne la taille approximative en octets d'un DataURL base64.
 */
export function estimateBase64Size(dataUrl: string): number {
  // Retirer le header "data:image/...;base64,"
  const base64 = dataUrl.split(',')[1] ?? dataUrl;
  return Math.round((base64.length * 3) / 4);
}

/**
 * Formate une taille en octets en chaîne lisible.
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}
