export interface CloudflareImage {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
    meta?: Record<string, unknown>;
}

export interface CloudflareResponse<T> {
    success: boolean;
    errors: Array<{ code: number; message: string }>;
    messages: Array<{ code: number; message: string }>;
    result: T;
}

export interface CloudflareListResponse extends CloudflareResponse<{ images: CloudflareImage[] }> { }

export interface CloudflareImageResponse extends CloudflareResponse<CloudflareImage> { }

export interface VariantOptions {
    fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
    width?: number;
    height?: number;
    metadata?: "keep" | "copyright" | "none";
}

export interface Variant {
    id: string;
    options: VariantOptions;
    neverRequireSignedURLs?: boolean;
}

// The API returns variants in a nested structure
export interface CloudflareVariantsResponse extends CloudflareResponse<{
    variants: {
        [key: string]: {
            id: string;
            options: VariantOptions;
            neverRequireSignedURLs?: boolean;
        };
    };
}> { } 