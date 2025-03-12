import Cloudflare from "cloudflare";
import { useLoaderData, useNavigate, Form, redirect } from "react-router";
import type { Route } from "../+types/root";
import type { CloudflareImageResponse, CloudflareVariantsResponse, Variant } from "../types/cloudflare";
import { getCachedImage, processCloudflareImage, invalidateCache } from "../lib/imagesCache";

interface LoaderData {
    image: ReturnType<typeof processCloudflareImage>;
    variants: Record<string, Variant>;
}

export async function action({ params, request }: Route.ActionArgs) {
    const formData = await request.formData();
    if (formData.get("_action") !== "delete") {
        throw new Error("Invalid action");
    }

    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

    if (!apiToken || !accountId) {
        throw new Error("Missing Cloudflare credentials");
    }

    try {
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${params.id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete image");
        }

        // Invalidate the cache
        invalidateCache();

        // Redirect to gallery
        return redirect('/');
    } catch (error) {
        throw new Error("Failed to delete image");
    }
}

export async function loader({ params }: Route.LoaderArgs) {
    if (!params.id) {
        throw new Error("Image ID is required");
    }

    // Try to get the image from cache first
    const cachedImage = getCachedImage(params.id);

    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;

    if (!apiToken || !accountId || !accountHash) {
        throw new Error("Missing Cloudflare credentials");
    }

    try {
        // Fetch image details
        const imageResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${params.id}`,
            {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!imageResponse.ok) {
            throw new Error("Failed to fetch image");
        }

        const imageData = await imageResponse.json() as CloudflareImageResponse;
        const processedImage = processCloudflareImage(imageData.result, accountHash);

        // Fetch variant details
        const variantsResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/variants`,
            {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!variantsResponse.ok) {
            console.error('Variants Response not OK:', await variantsResponse.text());
            throw new Error("Failed to fetch variants");
        }

        const variantsData = await variantsResponse.json() as CloudflareVariantsResponse;

        if (!variantsData.success) {
            console.error('Variants API Error:', variantsData.errors);
            throw new Error("Failed to fetch variants");
        }

        // Return both image and variants, using cached image if available
        return {
            image: cachedImage || processedImage,
            variants: variantsData.result.variants
        };
    } catch (error) {
        console.error('Loader Error:', error);
        throw new Error("Failed to fetch image details");
    }
}

export function ErrorBoundary() {
    const navigate = useNavigate();
    return (
        <main className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/gallery')}
                className="mb-8 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Gallery
            </button>
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Image</h1>
                <p className="text-gray-600">The requested image could not be found or there was an error loading it.</p>
            </div>
        </main>
    );
}

export default function ImageDetails() {
    const { image, variants } = useLoaderData<typeof loader>();
    const navigate = useNavigate();

    // Extract variant ID from URL (get the last segment after the last slash)
    const getVariantId = (variantUrl: string) => {
        return variantUrl.split('/').pop() || variantUrl;
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
            const form = document.getElementById('deleteForm') as HTMLFormElement;
            form.submit();
        }
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </button>

                <Form method="post" id="deleteForm">
                    <input type="hidden" name="_action" value="delete" />
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Image
                    </button>
                </Form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Column */}
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <img
                        src={image.href}
                        alt={image.filename}
                        className="w-full h-auto object-contain"
                    />
                </div>

                {/* Details Column */}
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold">{image.filename}</h1>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Upload Date</h2>
                            <p className="text-gray-600">
                                {new Date(image.uploaded).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Image ID</h2>
                            <p className="text-gray-600 font-mono">{image.id}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Variants</h2>
                            <div className="space-y-4 mt-2">
                                {image.variants.map((variantUrl) => {
                                    const variantId = getVariantId(variantUrl);
                                    const variant = variants?.[variantId];
                                    if (!variant) {
                                        return (
                                            <div key={variantId} className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="font-medium text-gray-900">{variantId}</h3>
                                                <p className="text-sm text-gray-500 mt-1">URL: {variantUrl}</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={variantId} className="bg-gray-50 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 mb-2">{variantId}</h3>
                                            <dl className="grid grid-cols-2 gap-2 text-sm">
                                                {variant.options.fit && (
                                                    <>
                                                        <dt className="text-gray-500">Fit</dt>
                                                        <dd className="text-gray-900">{variant.options.fit}</dd>
                                                    </>
                                                )}
                                                {variant.options.width && (
                                                    <>
                                                        <dt className="text-gray-500">Width</dt>
                                                        <dd className="text-gray-900">{variant.options.width}px</dd>
                                                    </>
                                                )}
                                                {variant.options.height && (
                                                    <>
                                                        <dt className="text-gray-500">Height</dt>
                                                        <dd className="text-gray-900">{variant.options.height}px</dd>
                                                    </>
                                                )}
                                                {variant.options.metadata && (
                                                    <>
                                                        <dt className="text-gray-500">Metadata</dt>
                                                        <dd className="text-gray-900">{variant.options.metadata}</dd>
                                                    </>
                                                )}
                                                <dt className="text-gray-500">Signed URLs Required</dt>
                                                <dd className="text-gray-900">
                                                    {variant.neverRequireSignedURLs ? "No" : "Yes"}
                                                </dd>
                                                <dt className="text-gray-500">URL</dt>
                                                <dd className="text-gray-900 break-all">{variantUrl}</dd>
                                            </dl>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {image.meta && Object.keys(image.meta).length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">Metadata</h2>
                                <dl className="grid grid-cols-2 gap-2">
                                    {Object.entries(image.meta).map(([key, value]) => (
                                        <div key={key} className="col-span-2">
                                            <dt className="text-sm font-medium text-gray-500">{key}</dt>
                                            <dd className="text-gray-600">{String(value)}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">Security</h2>
                            <p className="text-gray-600">
                                {image.requireSignedURLs ? 'Requires signed URLs' : 'Public access'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}