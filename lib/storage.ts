/**
 * ─────────────────────────────────────────────────────────────
 * VendorFlow – Supabase Storage Helper
 * ─────────────────────────────────────────────────────────────
 * MEMBER INTEGRATION CHECKLIST (Phase B):
 * - Suyash: app/drawings/, components/drawings/ (drawing revisions in 'drawings')
 * - Vedant: app/workshop/ (status photos in 'photos', workshop invoices in 'invoices')
 * - Abhi: app/payments/, app/deliveries/ (invoices and challan scans in 'invoices')
 * - Shiva: components/quality/ (inspection evidence photos in 'photos')
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@/lib/supabase/client';

export type StorageBucket = 'drawings' | 'photos' | 'invoices';

export interface UploadResult {
  path: string | null;
  url: string | null;
  error: string | null;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit

/**
 * Compresses an image in the browser using HTML5 Canvas before uploading
 * to ensure fast uploads on 4G networks.
 */
async function compressImageIfNeeded(file: File): Promise<Blob | File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/') || file.type.includes('svg')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Upload a file to a private Supabase Storage bucket with 5 MB validation
 * and image compression.
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  customPath?: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      path: null,
      url: null,
      error: `File size exceeds the 5 MB limit (file size: ${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    };
  }

  try {
    const supabase = createClient();
    const finalBlob = await compressImageIfNeeded(file);

    // Generate sanitized unique file path
    const fileExt = file.name.split('.').pop() || 'dat';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const uploadPath = customPath || fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, finalBlob, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return { path: null, url: null, error: error.message };
    }

    // Retrieve signed URL for temporary viewing
    const { signedUrl } = await getSignedUrl(bucket, data.path, 3600);

    return {
      path: data.path,
      url: signedUrl,
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed unexpectedly.';
    return { path: null, url: null, error: message };
  }
}

/**
 * Generate a short-expiry signed URL (default: 1 hour) to securely access private files.
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600
): Promise<{ signedUrl: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      return { signedUrl: null, error: error.message };
    }

    return { signedUrl: data.signedUrl, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate signed URL.';
    return { signedUrl: null, error: message };
  }
}
