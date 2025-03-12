import Cloudflare from "cloudflare";
import { useLoaderData, useNavigate, Form, useActionData } from "react-router";
import { useState } from "react";
import type { Route } from "../+types/root";
import type { CloudflareListResponse } from "../types/cloudflare";
import { getFromCache, updateCache, processCloudflareImage, invalidateCache } from "../lib/imagesCache";
import UploadModal from "../components/UploadModal";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "CloudFlare Images Admin" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  if (formData.get("_action") !== "upload") {
    throw new Error("Invalid action");
  }

  const file = formData.get("image") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    throw new Error("Missing Cloudflare credentials");
  }

  try {
    // Create form data for the API request
    const apiFormData = new FormData();
    apiFormData.append("file", file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
        },
        body: apiFormData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    // Invalidate cache to force refresh
    invalidateCache();
    return { success: true };
  } catch (error) {
    throw new Error("Failed to upload image");
  }
}

export async function loader() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH;

  if (!apiToken || !accountId || !accountHash) {
    throw new Error("Missing Cloudflare credentials");
  }

  // Check if we have valid cached data
  const cachedImages = getFromCache();
  if (cachedImages) {
    return { images: cachedImages };
  }

  const client = new Cloudflare({
    apiToken
  });

  try {
    const response = await client.images.v1.list({
      account_id: accountId,
      page: 1,
      per_page: 100
    }) as unknown as CloudflareListResponse;

    if (response.result?.images) {
      const processedImages = response.result.images.map(img =>
        processCloudflareImage(img, accountHash)
      );

      // Update cache
      updateCache(processedImages);

      return { images: processedImages };
    }

    return { images: [] };
  } catch (error) {
    throw new Error("Failed to fetch images");
  }
}

export default function Gallery() {
  const { images } = useLoaderData<typeof loader>();
  const actionData = useActionData();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 pt-16 pb-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gallery</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image.id}
            className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/image/${image.id}`)}
          >
            <img
              src={image.href}
              alt={`Uploaded ${image.uploadedAt ? new Date(image.uploadedAt).toLocaleDateString() : 'image'}`}
              className="w-full h-64 object-cover"
            />
          </div>
        ))}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        actionData={actionData}
      />
    </main>
  );
}

