export interface DashboardSummary {
  total_feeds: number;
  total_rss_sources: number;
  active_rss_sources: number;
  inactive_rss_sources: number;
  recent_cron_runs_24h: number;
  avg_engagement_score: string;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  subType: string;
}

export interface Author {
  id: number;
  name: string;
  bio: string;
  profile_picture: string;
}

export interface Source {
  id: number;
  name: string;
  website: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Language {
  id: number;
  name: string;
  code: string;
}

export interface Region {
  id: number;
  name: string;
  code: string;
}

export interface Status {
  id: number;
  name: "PREVIEW" | "PROCESSING" | "COMPLETED" | "FAILED";
  description: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Resource {
  id: number;
  name: string;
  url: string;
  content_type: {
    id: number;
    name: string;
    description: string;
  };
}

export interface Feed {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  slug: string;
  published_at?: string;
  web_url: string;
  layout: "photoDominant" | "textDominant" | "gallery" | "standardCard";
  is_featured: boolean;
  engagement_score: number;
  html?: string;
  Provider: Provider;
  provider?: Provider;
  Author: Author;
  author?: Author;
  Source: Source;
  source?: Source;
  Category: Category;
  category?: Category;
  Language: Language;
  language?: Language;
  Region: Region;
  region?: Region;
  status: Status;
  Status?: Status;
  tags: Tag[];
  resources: Resource[];
  sentiment?: any;
  entities?: any[];
  admin_feed_id?: string | null; // Link to admin_feeds table if admin-generated
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface DraftFeed {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  web_url?: string;
  html?: string;
  language_id?: string;
  category_id?: string;
  layout?: "photoDominant" | "textDominant" | "gallery" | "standardCard";
  is_featured?: boolean;
  resources?: any[];
  tags?: any[];
  created_by?: string;
  status?: "draft" | "review" | "scheduled";
  created_at?: string;
  updated_at?: string;
  provider: Provider;
  author: Author;
  source: Source;
  category: Category;
  language: Language;
  region: Region;
}

export interface RSSSource {
  id: string;
  provider_name: string;
  rss_url: string;
  language_code?: string;
  is_active: boolean;
  fetch_interval_minutes?: number;
  extractor_js?: string;
  last_fetched_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRSSSourceRequest {
  provider_name: string;
  rss_url: string;
  language_code?: string;
  is_active?: boolean;
  fetch_interval_minutes?: number;
  extractor_js?: string;
}

export interface UpdateRSSSourceRequest {
  provider_name?: string;
  rss_url?: string;
  language_code?: string;
  is_active?: boolean;
  fetch_interval_minutes?: number;
  extractor_js?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface CursorPagination {
  cursor: number | null;
  has_more: boolean;
  count: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface CursorPaginatedResponse<T> {
  items: T[];
  cursor: number | null;
  has_more: boolean;
  count: number;
}

export interface TodayStats {
  today: number;
  yesterday: number;
  difference: number;
  percentageChange: string;
  trend: "up" | "down" | "stable";
}

export interface ProviderStats {
  provider_name: string;
  feed_count: number;
  recent_feeds: number;
  language_code: string;
  is_active: boolean;
}

export interface TopFeed {
  id: string;
  title: string;
  engagement_score: number;
  sentiment: any;
  published_at: string;
  created_at: string;
  status: Status;
  provider: Provider;
  resources: Resource[];
}

export interface ProcessingStats {
  status: string;
  count: number;
  last_24h: number;
}

export interface APIError {
  error: string;
}

export interface User {
  id?: string;
  sysuid?: string;
  email?: string;
  display_name?: string;
  profile_picture?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  email?: string;
  password?: string;
  display_name?: string;
  profile_picture?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  token?: string;
  newPassword?: string;
}

export interface ToggleActionRequest {
  sysuid: string;
  feed_id: string;
  action_type: "like" | "share" | "save";
}
