/**
 * API Configuration and utilities for Vaulture frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Utility function to get proper image URL
 */
export const getImageUrl = (
  imageUrl,
  fallback = "/api/placeholder/400/300"
) => {
  if (!imageUrl) return fallback;
  return `${API_BASE_URL}/files/${imageUrl}`;
};

/**
 * Predefined categories for the platform
 */
export const PREDEFINED_CATEGORIES = [
  "Digital Art",
  "Photography",
  "Music",
  "Video",
  "Ebooks",
  "Software",
  "Templates",
  "Courses",
  "Fonts",
  "Graphics",
  "Other",
];

/**
 * Map frontend category to backend enum value
 */
export const mapToBackendCategory = (frontendCategory) => {
  const categoryMap = {
    "Digital Art": "digital_art",
    Photography: "photography",
    Music: "music",
    Video: "video",
    Ebooks: "ebooks",
    Software: "software",
    Templates: "templates",
    Courses: "courses",
    Fonts: "fonts",
    Graphics: "graphics",
    Other: "other",
  };

  return categoryMap[frontendCategory] || "other";
};

/**
 * Map backend category to predefined category
 */
export const mapToStandardCategory = (backendCategory) => {
  if (!backendCategory) return "Other";

  const categoryMap = {
    digital_art: "Digital Art",
    photography: "Photography",
    music: "Music",
    video: "Video",
    ebooks: "Ebooks",
    software: "Software",
    templates: "Templates",
    courses: "Courses",
    fonts: "Fonts",
    graphics: "Graphics",
    other: "Other",
  };

  return categoryMap[backendCategory.toLowerCase()] || "Other";
};

/**
 * Utility function to format creator name (remove email domain if present)
 */
export const formatCreatorName = (creatorName) => {
  if (!creatorName) return "Unknown Creator";
  return creatorName.includes("@") ? creatorName.split("@")[0] : creatorName;
};

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("vaulture_token");
  }
  return null;
};

/**
 * Make an authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // If body is FormData, remove Content-Type to let browser set multipart boundary
  if (config.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  // If body is provided and not FormData, stringify it
  else if (config.body && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses (like downloads)
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data?.detail || data?.message || "API request failed",
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError("Network error or server unavailable", 0, {
      originalError: error.message,
    });
  }
};

// Auth API calls
export const authApi = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: credentials,
    }),

  registerCreator: (userData) =>
    apiRequest("/auth/register/creator", {
      method: "POST",
      body: userData,
    }),

  registerBuyer: (userData) =>
    apiRequest("/auth/register/buyer", {
      method: "POST",
      body: userData,
    }),

  // Generic register that chooses endpoint based on is_creator field
  register: (userData) => {
    const endpoint = userData.is_creator
      ? "/auth/register/creator"
      : "/auth/register/buyer";
    const { is_creator, ...cleanUserData } = userData; // Remove is_creator from payload
    return apiRequest(endpoint, {
      method: "POST",
      body: cleanUserData,
    });
  },

  refreshToken: (refreshToken) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    }),

  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),
};

// Profile API calls
export const profileApi = {
  getMyProfile: () => apiRequest("/profile/me"),

  getPublicProfile: (userId) => apiRequest(`/profile/${userId}`),

  updateMyProfile: (profileData) =>
    apiRequest("/profile/me", {
      method: "PUT",
      body: profileData,
    }),

  changePassword: (passwordData) =>
    apiRequest("/profile/me/change-password", {
      method: "POST",
      body: passwordData,
    }),

  deleteAccount: () =>
    apiRequest("/profile/me", {
      method: "DELETE",
    }),

  searchUsers: (query, userType = null, limit = 20) => {
    const params = new URLSearchParams({ query, limit });
    if (userType) params.append("user_type", userType);

    return apiRequest(`/profile/search/users?${params}`);
  },
};

// Creator API calls
export const creatorApi = {
  upgradeToCreator: () =>
    apiRequest("/auth/upgrade-to-creator", {
      method: "POST",
    }),

  getProducts: () => apiRequest("/creator/products"),

  createProduct: (productData) =>
    apiRequest("/creator/products", {
      method: "POST",
      body: productData,
    }),

  updateProduct: (productId, productData) =>
    apiRequest(`/creator/products/${productId}`, {
      method: "PUT",
      body: productData,
    }),

  deleteProduct: (productId) =>
    apiRequest(`/creator/products/${productId}`, {
      method: "DELETE",
    }),

  uploadFile: (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach((key) => {
      formData.append(key, productData[key]);
    });

    return apiRequest("/creator/upload", {
      method: "POST",
      body: formData,
    });
  },

  // Analytics endpoints
  getAnalytics: () => apiRequest("/creator/analytics"),

  getSales: (limit = 10) => {
    const params = new URLSearchParams({ limit });
    return apiRequest(`/creator/sales?${params}`);
  },

  getSalesAnalytics: () => apiRequest("/creator/sales/analytics"),

  getStats: () => apiRequest("/creator/stats"),
};

// Buyer API calls
export const buyerApi = {
  getProducts: (params = {}) => {
    const {
      page = 1,
      query = "",
      category = "",
      min_price,
      max_price,
      creator_name = "",
      tags = "",
      page_size = 12,
      sort_by = "created_at",
      sort_order = "desc",
    } = params;

    const searchParams = new URLSearchParams({
      page: page.toString(),
      page_size: page_size.toString(),
      sort_by,
      sort_order,
    });

    if (query) searchParams.append("query", query);
    if (category) searchParams.append("category", category);
    if (min_price !== undefined)
      searchParams.append("min_price", min_price.toString());
    if (max_price !== undefined)
      searchParams.append("max_price", max_price.toString());
    if (creator_name) searchParams.append("creator_name", creator_name);
    if (tags) searchParams.append("tags", tags);

    return apiRequest(`/products?${searchParams}`);
  },

  getProduct: (productId) => apiRequest(`/products/${productId}`),

  getCategories: () => apiRequest("/products/categories"),

  getCreatorProducts: (creatorId) =>
    apiRequest(`/creator/${creatorId}/products`),

  getCreatorStats: (creatorId) => apiRequest(`/creator/${creatorId}/stats`),

  // Updated to match backend endpoint
  getPurchases: () => apiRequest("/purchase/mypurchases"),

  // Updated to match backend endpoint
  getAllPurchases: () => apiRequest("/purchase/mypurchases/all"),

  // Updated to match backend endpoint
  getPurchaseStats: () => apiRequest("/purchase/stats"),

  downloadProduct: (productId) => apiRequest(`/download/${productId}`),
};

// Purchase API calls
export const purchaseApi = {
  // Updated to match backend endpoint
  createCheckoutSession: (productId, purchaseData = {}) =>
    apiRequest(`/purchase/${productId}`, {
      method: "POST",
      body: {
        success_url: purchaseData.success_url,
        cancel_url: purchaseData.cancel_url,
        payment_method: "stripe",
      },
    }),

  // Updated to match backend endpoint
  verifyPurchase: (sessionId) =>
    apiRequest(`/purchase/verify/${sessionId}`, {
      method: "POST",
    }),

  // New endpoint from backend
  getPurchaseBySession: (sessionId) =>
    apiRequest(`/purchase/session/${sessionId}`),
};

// Platform admin API calls (if needed)
export const platformApi = {
  getAnalytics: () => apiRequest("/platform/analytics"),

  getUsers: (page = 1, search = "") => {
    const params = new URLSearchParams({ page });
    if (search) params.append("search", search);

    return apiRequest(`/platform/users?${params}`);
  },
};
