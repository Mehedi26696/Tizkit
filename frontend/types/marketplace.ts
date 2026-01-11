export type MarketplaceItemType = 'template' | 'project';

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string;
}

export interface MarketplaceItem {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string | null;
  item_type: MarketplaceItemType;
  latex_content: string | null;
  preamble: string | null;
  rating_avg: number;
  review_count: number;
  usage_count: number;
  preview_image_url: string | null;
  is_free: boolean;
  price: number;
  tags: string | null;
  created_at: string;
  updated_at: string;
  username?: string;
  category_name?: string;
}

export interface MarketplaceReview {
  id: string;
  user_id: string;
  item_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  username?: string;
}

export interface MarketplaceItemListResponse {
  items: MarketplaceItem[];
  total: number;
}
