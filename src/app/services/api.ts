import type {
  DashboardSummary,
  RSSSource,
  CreateRSSSourceRequest,
  UpdateRSSSourceRequest,
  Feed,
  DraftFeed,
  PaginatedResponse,
  CursorPaginatedResponse,
  TodayStats,
  ProviderStats,
  TopFeed,
  ProcessingStats,
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ToggleActionRequest,
  Ad,
  CreateAdRequest,
  UpdateAdRequest,
  AdminNotification,
  SubscriptionCheck,
  SubscriptionGrantRequest,
  SubscriptionRecord,
} from "../types/api";

const API_BASE_URL =
  (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3000/api";

class APIClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401 && window.location.pathname !== "/login") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }

        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || errorData.error || "An error occurred",
          status: response.status,
          errors: errorData.errors,
        };
      }
      if (response.status === 204) {
        return { message: "No content" } as unknown as T;
      } else {
        return await response.json();
      }
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }
      throw {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>("/analytics/dashboard-summary");
  }
  
  async getDashboardSummary24(): Promise<DashboardSummary> {
    return this.request<DashboardSummary>("/analytics/dashboard-summary-24h");
  }

  async getTodayStats(): Promise<TodayStats> {
    return this.request<TodayStats>("/analytics/today-stats");
  }

  async getProviderStats(days: number = 7): Promise<ProviderStats[]> {
    return this.request<ProviderStats[]>(
      `/analytics/feeds-by-provider?days=${days}`,
    );
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getTopFeeds(params?: {
    limit?: number;
    days?: number;
    lang?: string;
  }): Promise<TopFeed[]> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.days) queryParams.append("days", params.days.toString());
    if (params?.lang) queryParams.append("lang", params.lang);

    const query = queryParams.toString();
    return this.request<TopFeed[]>(
      `/analytics/top-feeds${query ? `?${query}` : ""}`,
    );
  }

  async getProcessingStats(): Promise<ProcessingStats[]> {
    return this.request<ProcessingStats[]>("/analytics/processing-stats");
  }

  // RSS Sources
  async getRSSSources(params?: {
    page?: number;
    limit?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<PaginatedResponse<RSSSource>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());

    const query = queryParams.toString();
    return this.request<PaginatedResponse<RSSSource>>(
      `/rss-sources${query ? `?${query}` : ""}`,
    );
  }

  async getRSSSourceById(id: string): Promise<RSSSource> {
    return this.request<RSSSource>(`/rss-sources/${id}`);
  }

  async createRSSSource(data: CreateRSSSourceRequest): Promise<RSSSource> {
    return this.request<RSSSource>("/rss-sources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateRSSSource(
    id: string,
    data: UpdateRSSSourceRequest,
  ): Promise<RSSSource> {
    return this.request<RSSSource>(`/rss-sources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteRSSSource(id: string): Promise<void> {
    return this.request<void>(`/rss-sources/${id}`, {
      method: "DELETE",
    });
  }

  async deleteRSSSourcesBulk(ids: string[]): Promise<void> {
    return this.request<void>("/rss-sources/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  }

  async toggleRSSSourceStatus(
    id: string,
    is_active: boolean,
  ): Promise<RSSSource> {
    return this.request<RSSSource>(`/rss-sources/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    });
  }

  async getFeedsBySourceId(
    sourceId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Feed>>(
      `/rss-sources/${sourceId}/feeds${query ? `?${query}` : ""}`,
    );
  }

  async triggerFeedFetch(sourceId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/rss-sources/${sourceId}/fetch`, {
      method: "POST",
    });
  }

  // Feeds (Articles)
  async getFeeds(params?: {
    limit?: number;
    cursor?: number;
    lang?: string;
    pref?: string;
  }): Promise<CursorPaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.cursor) queryParams.append("cursor", params.cursor.toString());
    if (params?.lang) queryParams.append("lang", params.lang);
    if (params?.pref) queryParams.append("pref", params.pref);

    const query = queryParams.toString();
    return this.request<CursorPaginatedResponse<Feed>>(
      `/feed${query ? `?${query}` : ""}`,
    );
  }

  async getFeedById(id: string): Promise<Feed> {
    return this.request<Feed>(`/feed/id/${id}`);
  }

  async updateClientFeed(id: string, data: Partial<Feed>): Promise<Feed> {
    return this.request<Feed>(`/feed/id/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async takeDownFeed(feedId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/feed/id/${feedId}/takedown`, {
      method: "POST",
    });
  }

  async restoreClientFeed(feedId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/feed/id/${feedId}/restore`, {
      method: "POST",
    });
  }

  async getTakenDownFeeds(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Feed>>(
      `/feed/taken-down${query ? `?${query}` : ""}`,
    );
  }

  // Admin Feed Management (for admin panel)
  async getAdminFeedById(id: string): Promise<Feed> {
    return this.request<Feed>(`/admin-feeds/drafts/${id}`);
  }

  async updateAdminFeed(id: string, data: Partial<Feed>): Promise<Feed> {
    return this.request<Feed>(`/admin-feeds/drafts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Admin Feeds (Admin Workspace)
  async getAdminQueue(params?: {
    page?: number;
    limit?: number;
    status?: "draft" | "review" | "scheduled";
    search?: string;
    created_by?: string;
  }): Promise<PaginatedResponse<DraftFeed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.created_by) queryParams.append("created_by", params.created_by);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<DraftFeed>>(
      `/admin-feeds/queue${query ? `?${query}` : ""}`,
    );
  }

  async getAdminPublished(params?: {
    page?: number;
    limit?: number;
    search?: string;
    created_by?: string;
  }): Promise<
    PaginatedResponse<{
      Feed: Feed;
      DraftFeed: DraftFeed;
      published_at: string;
      createdAt: string;
      createdBy: string;
      draftId: string;
      feedId: string;
      id: string;
      updatedAt: string;
    }>
  > {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.created_by) queryParams.append("created_by", params.created_by);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<any>>(
      `/admin-feeds/published${query ? `?${query}` : ""}`,
    );
  }

  // Draft Feeds
  async getDrafts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    created_by?: string;
  }): Promise<PaginatedResponse<DraftFeed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.created_by) queryParams.append("created_by", params.created_by);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<DraftFeed>>(
      `/admin-feeds/drafts${query ? `?${query}` : ""}`,
    );
  }

  async getDraftById(id: string): Promise<DraftFeed> {
    return this.request<DraftFeed>(`/admin-feeds/drafts/${id}`);
  }

  async createDraft(data: Partial<DraftFeed>): Promise<DraftFeed> {
    return this.request<DraftFeed>("/admin-feeds/drafts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDraft(id: string, data: Partial<DraftFeed>): Promise<DraftFeed> {
    return this.request<DraftFeed>(`/admin-feeds/drafts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDraft(id: string): Promise<void> {
    return this.request<void>(`/admin-feeds/drafts/${id}`, {
      method: "DELETE",
    });
  }

  async publishDraft(id: string, created_by: string): Promise<Feed> {
    return this.request<Feed>(`/admin-feeds/drafts/${id}/publish`, {
      method: "POST",
      body: JSON.stringify({ created_by }),
    });
  }

  // Published Admin Feeds
  async getPublishedFeeds(params?: {
    page?: number;
    limit?: number;
    created_by?: string;
  }): Promise<PaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.created_by) queryParams.append("created_by", params.created_by);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Feed>>(
      `/admin-feeds/published${query ? `?${query}` : ""}`,
    );
  }

  async getPublishedFeedById(id: string): Promise<Feed> {
    return this.request<Feed>(`/admin-feeds/published/${id}`);
  }

  // Soft Delete & Restore
  async softDeleteFeed(feedId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/admin-feeds/drafts/${feedId}/soft-delete`,
      {
        method: "POST",
      },
    );
  }

  async restoreFeed(feedId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/admin-feeds/drafts/${feedId}/restore`,
      {
        method: "POST",
      },
    );
  }

  async getDeletedFeeds(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Feed>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return this.request<PaginatedResponse<Feed>>(
      `/admin-feeds/drafts/deleted${query ? `?${query}` : ""}`,
    );
  }

  // Auth Methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createUser(data: RegisterRequest & { role?: string }): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User Methods
  async getOrCreateUserBySysuid(sysuid: string): Promise<User> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify({ sysuid }),
    });
  }

  async getUserById(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  async updateUser(
    userId: string,
    data: Partial<User>,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateUserRole(
    userId: string,
    role: string,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  // User Actions
  async toggleUserAction(
    data: ToggleActionRequest,
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>("/user-actions/toggle", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);

    const query = queryParams.toString();
    return this.request<PaginatedResponse<User>>(
      `/users${query ? `?${query}` : ""}`,
    );
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request<void>(`/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Ads Management
  async getAds(): Promise<Ad[]> {
    return this.request<Ad[]>("/ads");
  }

  async getAdById(id: string): Promise<Ad> {
    return this.request<Ad>(`/ads/${id}`);
  }

  async createAd(data: CreateAdRequest): Promise<Ad> {
    return this.request<Ad>("/ads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAd(id: string, data: UpdateAdRequest): Promise<Ad> {
    return this.request<Ad>(`/ads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAd(id: string): Promise<void> {
    return this.request<void>(`/ads/${id}`, {
      method: "DELETE",
    });
  }

  // Admin Notifications
  async getAdminNotifications(): Promise<AdminNotification[]> {
    return this.request<AdminNotification[]>("/admin-notifications");
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request<void>(`/admin-notifications/${id}/read`, {
      method: "POST",
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request<void>("/admin-notifications/read-all", {
      method: "POST",
    });
  }

  // Subscription Management
  async checkSubscription(userId: string): Promise<SubscriptionCheck> {
    return this.request<SubscriptionCheck>(`/subscriptions/check/${userId}`);
  }

  async grantSubscription(data: SubscriptionGrantRequest): Promise<void> {
    return this.request<void>("/subscriptions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSubscriptionHistory(userId: string): Promise<SubscriptionRecord[]> {
    return this.request<SubscriptionRecord[]>(`/subscriptions/history/${userId}`);
  }
}


export const apiClient = new APIClient(API_BASE_URL);
