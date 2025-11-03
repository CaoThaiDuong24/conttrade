import { apiClient } from "./client";

export interface MediaUploadResponse {
  success: boolean;
  data: {
    media: {
      id: string;
      url: string;
      type: 'image' | 'video';
      size: number;
      filename: string;
    };
  };
}

export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  // Use relative path for API calls (proxied through Nginx)
  const uploadUrl = '/api/v1/media/upload';
  
  const token = localStorage.getItem('accessToken');
  
  console.log('=== UPLOAD MEDIA DEBUG ===');
  console.log('Upload URL:', uploadUrl);
  console.log('File:', file.name, file.type, file.size);
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);

  // Use fetch directly for file upload as apiClient might not handle FormData properly
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  console.log('Response status:', response.status);
  console.log('Response URL:', response.url);

  if (!response.ok) {
    const errorText = await response.text();
    console.log('Error response:', errorText);
    
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { message: errorText || 'Upload failed' };
    }
    
    throw new Error(error.message || `Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  console.log('Upload success:', result);
  return result;
}

export async function deleteMedia(filename: string): Promise<{ success: boolean }> {
  return apiClient.request({
    method: 'DELETE',
    path: `/api/v1/media/${filename}`,
  });
}

export async function addMediaToListing(listingId: string, mediaData: {
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  sortOrder?: number;
}): Promise<{ success: boolean; data: any }> {
  return apiClient.request({
    method: 'POST',
    path: `/api/v1/listings/${listingId}/media`,
    body: mediaData,
  });
}

export async function removeMediaFromListing(listingId: string, mediaId: string): Promise<{ success: boolean }> {
  return apiClient.request({
    method: 'DELETE',
    path: `/api/v1/listings/${listingId}/media/${mediaId}`,
  });
}