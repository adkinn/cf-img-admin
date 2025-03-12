export interface GalleryImage {
    id: string;
    href: string;
    filename: string;
    uploadedAt: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
    meta?: Record<string, string>;
}

export interface ImagesCache {
    data: GalleryImage[];
    timestamp: number;
}

const CACHE_DURATION = 60 * 1000; // 60 seconds in milliseconds

// Cache the images list for 60 seconds
let imagesCache: ImagesCache | null = null;

export function getFromCache(): GalleryImage[] | null {
    if (imagesCache &&
        (Date.now() - imagesCache.timestamp) < CACHE_DURATION &&
        imagesCache.data.length > 0) {
        return imagesCache.data;
    }
    return null;
}

export function updateCache(images: GalleryImage[]): void {
    imagesCache = {
        data: images,
        timestamp: Date.now()
    };
}

export function invalidateCache(): void {
    imagesCache = null;
}

export function getCachedImage(id: string): GalleryImage | null {
    const cachedData = getFromCache();
    if (cachedData) {
        const image = cachedData.find(img => img.id === id);
        return image || null;
    }
    return null;
}

export function processCloudflareImage(image: any, accountHash: string): GalleryImage {
    return {
        id: image.id,
        filename: image.filename,
        href: `https://imagedelivery.net/${accountHash}/${image.id}/public`,
        uploadedAt: image.uploaded,
        uploaded: image.uploaded,
        requireSignedURLs: image.requireSignedURLs,
        variants: image.variants,
        meta: image.meta
    };
} 