import apiClient from './client';
import type {
  MarketplaceCategory,
  MarketplaceItem,
  MarketplaceItemListResponse,
  MarketplaceReview,
  MarketplaceItemType
} from '@/types/marketplace';

/**
 * Get all marketplace categories
 */
export async function getMarketplaceCategories(): Promise<MarketplaceCategory[]> {
  const response = await apiClient.get<MarketplaceCategory[]>('/marketplace/categories');
  return response.data;
}

/**
 * List marketplace items with optional filters
 */
export async function listMarketplaceItems(params: {
  category_id?: string;
  item_type?: MarketplaceItemType;
  search?: string;
  user_id?: string;
  sort_by?: 'newest' | 'popular' | 'top_rated';
  offset?: number;
  limit?: number;
}): Promise<MarketplaceItemListResponse> {
  const response = await apiClient.get<MarketplaceItemListResponse>('/marketplace/items', { params });
  return response.data;
}

/**
 * Get a specific marketplace item
 */
export async function getMarketplaceItem(itemId: string): Promise<MarketplaceItem> {
  const response = await apiClient.get<MarketplaceItem>(`/marketplace/items/${itemId}`);
  return response.data;
}

/**
 * Export a project/template to the marketplace
 */
export async function exportToMarketplace(data: {
  title: string;
  description?: string;
  category_id?: string;
  item_type: MarketplaceItemType;
  is_free?: boolean;
  price?: number;
  latex_content?: string;
  preamble?: string;
  preview_image_url?: string;
  tags?: string;
}): Promise<MarketplaceItem> {
  const response = await apiClient.post<MarketplaceItem>('/marketplace/items', data);
  return response.data;
}

/**
 * Submit a review for a marketplace item
 */
export async function submitMarketplaceReview(data: {
  item_id: string;
  rating: number;
  comment?: string;
}): Promise<MarketplaceReview> {
  const response = await apiClient.post<MarketplaceReview>(`/marketplace/items/${data.item_id}/reviews`, data);
  return response.data;
}
/**
 * Install a marketplace item (deploy to user's project library)
 */
export async function installMarketplaceItem(itemId: string): Promise<{ status: string; id: string; type: 'project' | 'template' }> {
  const response = await apiClient.post<{ status: string; id: string; type: 'project' | 'template' }>(`/marketplace/items/${itemId}/install`);
  return response.data;
}
/**
 * Delete a marketplace item
 */
export async function deleteMarketplaceItem(itemId: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete<{ status: string; message: string }>(`/marketplace/items/${itemId}`);
  return response.data;
}
