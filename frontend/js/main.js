// Vaulture Frontend JavaScript
// API integration and utility functions

class VaultureAPI {
  constructor() {
    // Environment-based API URL configuration
    this.baseURL = this.getApiBaseUrl();
    this.token = localStorage.getItem("authToken");
  }

  // Get API base URL based on environment
  getApiBaseUrl() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Development environment
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }

    // Production environment - adjust this to your production API URL
    if (hostname.includes("yourdomain.com")) {
      return "https://api.yourdomain.com";
    }

    // Default to relative path for same-origin API
    return "/api";
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);

    // Update navigation state when token changes
    if (typeof updateNavigationState === "function") {
      updateNavigationState();
    }
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("userType");
    localStorage.removeItem("userProfile");

    // Update navigation state when token is removed
    if (typeof updateNavigationState === "function") {
      updateNavigationState();
    }
  }

  // Set user type
  setUserType(userType) {
    localStorage.setItem("userType", userType);
  }

  // Get user type
  getUserType() {
    return localStorage.getItem("userType");
  }

  // Set user profile
  setUserProfile(profile) {
    localStorage.setItem("userProfile", JSON.stringify(profile));

    // Update navigation state when profile changes
    if (typeof updateNavigationState === "function") {
      updateNavigationState();
    }
  }

  // Get user profile
  getUserProfile() {
    const profile = localStorage.getItem("userProfile");
    return profile ? JSON.parse(profile) : null;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle different response types
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          // Unauthorized - clear token and redirect to login
          this.removeToken();
          if (!window.location.pathname.includes("login.html")) {
            Utils.showNotification(
              "Your session has expired. Please log in again.",
              "warning"
            );
            setTimeout(() => {
              window.location.href =
                "login.html?redirect=" +
                encodeURIComponent(window.location.pathname);
            }, 2000);
          }
          throw new Error("Authentication required");
        } else if (response.status === 403) {
          throw new Error("You don't have permission to perform this action");
        } else if (response.status === 404) {
          throw new Error("Resource not found");
        } else if (response.status >= 500) {
          throw new Error("Server error. Please try again later.");
        }

        throw new Error(data.detail || data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      // Network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error("Network error - API server may be unavailable:", error);
        throw new Error(
          "Unable to connect to server. Please check your internet connection."
        );
      }

      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication methods
  async registerCreator(userData) {
    return this.request("/auth/register/creator", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async registerBuyer(userData) {
    return this.request("/auth/register/buyer", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    try {
      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      if (response.access_token) {
        this.setToken(response.access_token);

        // Store user type and profile if available
        if (response.user) {
          this.setUserType(
            response.user.user_type || response.user.account_type
          );
          this.setUserProfile(response.user);
        }

        // Update navigation state immediately
        if (typeof updateNavigationState === "function") {
          updateNavigationState();
        }
      }

      return response;
    } catch (error) {
      // Provide user-friendly error messages for login failures
      if (
        error.message.includes("Invalid credentials") ||
        error.message.includes("401")
      ) {
        throw new Error("Invalid email or password. Please try again.");
      } else if (error.message.includes("User not found")) {
        throw new Error("No account found with this email address.");
      }
      throw error;
    }
  }

  async upgradeToCreator() {
    return this.request("/auth/upgrade-to-creator", {
      method: "POST",
    });
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProductCategories() {
    return this.request("/products/categories");
  }

  async uploadProduct(formData, onProgress = null) {
    const url = `${this.baseURL}/creator/upload`;
    const headers = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error("Invalid response format"));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || "Upload failed"));
          } catch (parseError) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout - file may be too large"));
      });

      xhr.open("POST", url);

      // Set headers
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });

      // Set timeout (30 minutes for large files)
      xhr.timeout = 30 * 60 * 1000;

      xhr.send(formData);
    });
  }

  async getMyProducts() {
    return this.request("/creator/products");
  }

  async getCreatorStats() {
    return this.request("/creator/stats");
  }

  // Purchase methods
  async createCheckoutSession(productId, purchaseData) {
    return this.request(`/purchase/${productId}`, {
      method: "POST",
      body: JSON.stringify(purchaseData),
    });
  }

  async getMyPurchases() {
    return this.request("/purchase/mypurchases");
  }

  async getPurchaseStats() {
    return this.request("/purchase/stats");
  }

  // Profile methods
  async getProfile() {
    return this.request("/profile/me");
  }

  async updateProfile(profileData) {
    return this.request("/profile/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request("/profile/me/change-password", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  // Platform methods
  async getPlatformStats() {
    return this.request("/platform/stats");
  }
}

// Initialize API client
const api = new VaultureAPI();

// Utility functions
class Utils {
  // Format price
  static formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  }

  // Format date
  static formatDate(dateString) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  }

  // Validate email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password
  static isValidPassword(password) {
    return (
      password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password)
    );
  }

  // Format file size
  static formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Show notification
  static showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;

    // Set notification content
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${this.getNotificationIcon(type)}</span>
        <span class="notification-message">${this.sanitizeHTML(message)}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Create notifications container if it doesn't exist
    let container = document.querySelector(".notifications-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "notifications-container";

      // Apply styles programmatically to ensure they work
      const styles = {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "9999",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      };

      Object.assign(container.style, styles);
      document.body.appendChild(container);
    }

    // Apply notification styles programmatically
    const notificationStyles = {
      padding: "12px 16px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      lineHeight: "1.4",
      opacity: "0",
      transform: "translateX(100%)",
      transition: "all 0.3s ease",
      color: "#fff",
      minWidth: "300px",
    };

    // Type-specific colors
    const typeColors = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };

    Object.assign(notification.style, notificationStyles);
    notification.style.backgroundColor = typeColors[type] || typeColors.info;

    container.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  // Get notification icon based on type
  static getNotificationIcon(type) {
    const icons = {
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[type] || icons.info;
  }

  // Show loading state
  static showLoading(element) {
    element.classList.add("loading");
    element.disabled = true;
  }

  // Hide loading state
  static hideLoading(element) {
    element.classList.remove("loading");
    element.disabled = false;
  }

  // Sanitize HTML
  static sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }
}

// Form handling utilities
class FormHandler {
  constructor(formElement) {
    this.form = formElement;
    this.setupValidation();
  }

  // Setup real-time validation
  setupValidation() {
    const inputs = this.form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("blur", () => this.validateField(input));
      input.addEventListener(
        "input",
        Utils.debounce(() => this.validateField(input), 500)
      );
    });
  }

  // Validate individual field
  validateField(field) {
    const errors = [];
    const value = field.value.trim();
    const fieldName = field.name || field.id;

    // Required field validation
    if (field.required && !value) {
      errors.push(`${fieldName} is required`);
    }

    // Email validation
    if (field.type === "email" && value && !Utils.isValidEmail(value)) {
      errors.push("Please enter a valid email address");
    }

    // Password validation
    if (field.type === "password" && value && !Utils.isValidPassword(value)) {
      errors.push(
        "Password must be at least 8 characters with letters and numbers"
      );
    }

    // Show/hide errors
    this.showFieldErrors(field, errors);
    return errors.length === 0;
  }

  // Show field errors
  showFieldErrors(field, errors) {
    // Remove existing error messages
    const existingError = field.parentNode.querySelector(".form-error");
    if (existingError) {
      existingError.remove();
    }

    // Add new error message
    if (errors.length > 0) {
      const errorElement = document.createElement("div");
      errorElement.className = "form-error";
      errorElement.textContent = errors[0];
      field.parentNode.appendChild(errorElement);
      field.classList.add("error");
    } else {
      field.classList.remove("error");
    }
  }

  // Validate entire form
  validate() {
    const inputs = this.form.querySelectorAll("input, textarea, select");
    let isValid = true;

    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Get form data as object
  getData() {
    const formData = new FormData(this.form);
    const data = {};

    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  // Reset form
  reset() {
    this.form.reset();
    const errors = this.form.querySelectorAll(".form-error");
    errors.forEach((error) => error.remove());

    const inputs = this.form.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => input.classList.remove("error"));
  }
}

// Modal utilities
class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.overlay = this.modal;
    this.content = this.modal.querySelector(".modal-content");

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on close button click
    const closeBtn = this.modal.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.classList.contains("active")) {
        this.close();
      }
    });
  }

  open() {
    this.modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  setContent(html) {
    const body = this.modal.querySelector(".modal-body");
    if (body) {
      body.innerHTML = html;
    }
  }
}

// File upload utilities
class FileUpload {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      maxSize: 100 * 1024 * 1024, // 100MB default
      allowedTypes: [], // Empty array means all types allowed
      multiple: false,
      onFilesSelected: null,
      onError: null,
      ...options,
    };

    this.setupEventListeners();
    this.setupDropZoneStyles();
  }

  setupDropZoneStyles() {
    // Ensure the drop zone has proper visual feedback
    const styles = {
      border: "2px dashed #d1d5db",
      borderRadius: "8px",
      padding: "40px 20px",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: "#f9fafb",
    };

    Object.assign(this.element.style, styles);
  }

  setupEventListeners() {
    // Drag and drop events
    this.element.addEventListener("dragover", this.handleDragOver.bind(this));
    this.element.addEventListener("dragleave", this.handleDragLeave.bind(this));
    this.element.addEventListener("drop", this.handleDrop.bind(this));

    // Click to select file
    this.element.addEventListener("click", () => {
      this.openFileDialog();
    });

    // Prevent default drag behaviors on the document
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  openFileDialog() {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = this.options.multiple;

    if (this.options.allowedTypes.length > 0) {
      input.accept = this.options.allowedTypes.join(",");
    }

    input.addEventListener("change", (e) => {
      this.handleFiles(e.target.files);
    });

    input.click();
  }

  handleDragOver(e) {
    e.preventDefault();
    this.element.style.borderColor = "#3b82f6";
    this.element.style.backgroundColor = "#eff6ff";
    this.element.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.preventDefault();
    this.element.style.borderColor = "#d1d5db";
    this.element.style.backgroundColor = "#f9fafb";
    this.element.classList.remove("dragover");
  }

  handleDrop(e) {
    e.preventDefault();
    this.element.style.borderColor = "#d1d5db";
    this.element.style.backgroundColor = "#f9fafb";
    this.element.classList.remove("dragover");
    this.handleFiles(e.dataTransfer.files);
  }

  handleFiles(files) {
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file) => {
      const validation = this.validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors if any
    if (errors.length > 0 && this.options.onError) {
      this.options.onError(errors);
    } else if (errors.length > 0) {
      Utils.showNotification(errors.join("\n"), "error");
    }

    // Process valid files
    if (validFiles.length > 0) {
      if (this.options.onFilesSelected) {
        this.options.onFilesSelected(validFiles);
      } else {
        this.onFilesSelected(validFiles);
      }
    }
  }

  validateFile(file) {
    // Check file size
    if (file.size > this.options.maxSize) {
      return {
        isValid: false,
        error: `File is too large. Maximum size is ${Utils.formatFileSize(
          this.options.maxSize
        )}`,
      };
    }

    // Check file type
    if (this.options.allowedTypes.length > 0) {
      const fileType = file.type || "";
      const fileName = file.name.toLowerCase();

      const isAllowed = this.options.allowedTypes.some((type) => {
        if (type.includes("*")) {
          return fileType.startsWith(type.replace("*", ""));
        }
        if (type.startsWith(".")) {
          return fileName.endsWith(type);
        }
        return fileType === type;
      });

      if (!isAllowed) {
        return {
          isValid: false,
          error: `File type not allowed. Allowed types: ${this.options.allowedTypes.join(
            ", "
          )}`,
        };
      }
    }

    return { isValid: true };
  }

  onFilesSelected(files) {
    // Override this method in subclasses or set as callback in options
    console.log("Files selected:", files);
  }

  // Method to update the drop zone text
  updateText(text) {
    this.element.innerHTML = `
      <div style="pointer-events: none;">
        <div style="font-size: 24px; margin-bottom: 8px;">📄</div>
        <div>${text}</div>
      </div>
    `;
  }

  // Method to show file selected state
  showFileSelected(file) {
    this.element.innerHTML = `
      <div style="pointer-events: none;">
        <div style="font-size: 24px; margin-bottom: 8px;">${this.getFileIcon(
          file.type
        )}</div>
        <div style="font-weight: 600; margin-bottom: 4px;">${file.name}</div>
        <div style="color: #6b7280; font-size: 14px;">${Utils.formatFileSize(
          file.size
        )}</div>
        <div style="margin-top: 8px; color: #10b981;">✓ File selected</div>
      </div>
    `;
    this.element.style.borderColor = "#10b981";
    this.element.style.backgroundColor = "#f0fdf4";
  }

  getFileIcon(fileType) {
    if (!fileType) return "📄";

    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("video")) return "🎥";
    if (fileType.includes("audio")) return "🎵";
    if (fileType.includes("pdf")) return "📋";
    if (fileType.includes("zip") || fileType.includes("archive")) return "📦";
    if (fileType.includes("text") || fileType.includes("code")) return "💻";

    return "📄";
  }

  // Reset the file upload area
  reset() {
    this.updateText("Click to upload or drag and drop");
    this.element.style.borderColor = "#d1d5db";
    this.element.style.backgroundColor = "#f9fafb";
  }
}

// Authentication check
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    // Redirect to login if on protected page
    const protectedPaths = ["/dashboard", "/creator", "/profile", "/upload"];
    const currentPath = window.location.pathname;

    if (protectedPaths.some((path) => currentPath.includes(path))) {
      window.location.href = "/frontend/login.html";
      return false;
    }
    return false;
  }
  return true;
}

// Logout functionality
function logout() {
  // Clear all auth data
  api.removeToken();

  // Show notification
  Utils.showNotification("You have been logged out successfully", "success");

  // Update navigation immediately
  updateNavigationState();

  // Redirect to home page after a short delay
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Debug function to clear all auth data (for testing)
function clearAuthData() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userProfile");
  console.log("All auth data cleared");
  updateNavigationState();
}

// Navigation state management
function updateNavigationState() {
  const token = localStorage.getItem("authToken");
  let loggedOutNav = document.getElementById("navLoggedOut");
  let loggedInNav = document.getElementById("navLoggedIn");

  console.log("updateNavigationState called", {
    token: !!token,
    loggedOutNav: !!loggedOutNav,
    loggedInNav: !!loggedInNav,
  });

  // Create navigation elements if they don't exist
  if (!loggedOutNav || !loggedInNav) {
    console.log("Navigation elements missing, attempting to create them");
    const navActions = document.querySelector(".nav-actions");

    if (navActions) {
      // Create logged out nav if missing
      if (!loggedOutNav) {
        loggedOutNav = document.createElement("div");
        loggedOutNav.className = "nav-actions-logged-out";
        loggedOutNav.id = "navLoggedOut";
        navActions.appendChild(loggedOutNav);
      }

      // Create logged in nav if missing
      if (!loggedInNav) {
        loggedInNav = document.createElement("div");
        loggedInNav.className = "nav-actions-logged-in";
        loggedInNav.id = "navLoggedIn";
        navActions.appendChild(loggedInNav);
      }
    } else {
      console.warn("No .nav-actions element found - cannot create navigation");
      return;
    }
  }

  if (token) {
    // User is logged in - hide login buttons, show avatar
    console.log("User is logged in, showing avatar");
    loggedOutNav.style.display = "none";
    loggedInNav.style.display = "flex";

    // Update avatar with proper structure
    const currentPage = window.location.pathname;
    const avatarHTML = `
      <div class="user-dropdown">
        <div class="user-avatar" onclick="toggleUserDropdown()" id="userAvatarBtn">
          <div class="avatar-circle">
            <span id="navAvatarInitials">U</span>
          </div>
        </div>
        <div class="dropdown-menu" id="userDropdownMenu" style="display: none;">
          <div class="dropdown-item" style="font-weight: 600; color: var(--text-primary);">
            <span id="userDisplayName">User</span>
          </div>
          <div class="dropdown-divider"></div>
          ${
            !currentPage.includes("profile.html")
              ? '<a href="profile.html" class="dropdown-item">Profile Settings</a>'
              : ""
          }
          ${
            !currentPage.includes("dashboard.html")
              ? '<a href="dashboard.html" class="dropdown-item">Dashboard</a>'
              : ""
          }
          ${
            !currentPage.includes("marketplace.html")
              ? '<a href="marketplace.html" class="dropdown-item">Marketplace</a>'
              : ""
          }
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout-btn" onclick="logout()">
            Sign Out
          </button>
        </div>
      </div>
    `;

    if (loggedInNav.innerHTML !== avatarHTML) {
      loggedInNav.innerHTML = avatarHTML;
    }

    // Update avatar initials and display name
    updateUserAvatar();
  } else {
    // User is not logged in - show login buttons, hide avatar
    console.log("User is not logged in, showing login buttons");
    loggedOutNav.style.display = "flex";
    loggedInNav.style.display = "none";

    // Set appropriate login buttons based on current page
    const currentPage = window.location.pathname;
    let loginNavHTML = "";

    if (currentPage.includes("login.html")) {
      loginNavHTML =
        '<a href="signup.html" class="btn btn-primary">Sign up</a>';
    } else if (currentPage.includes("signup.html")) {
      loginNavHTML =
        '<a href="login.html" class="btn btn-secondary">Log in</a>';
    } else {
      loginNavHTML = `
        <a href="login.html" class="btn btn-secondary">Log in</a>
        <a href="signup.html" class="btn btn-primary">Start selling</a>
      `;
    }

    if (loggedOutNav.innerHTML !== loginNavHTML) {
      loggedOutNav.innerHTML = loginNavHTML;
    }
  }
}

// Update user avatar with profile information
function updateUserAvatar() {
  const userProfile = api.getUserProfile();
  const avatarInitials = document.getElementById("navAvatarInitials");
  const userDisplayName = document.getElementById("userDisplayName");

  if (avatarInitials) {
    if (userProfile && userProfile.display_name) {
      avatarInitials.textContent = getInitials(userProfile.display_name);
    } else if (userProfile && userProfile.email) {
      avatarInitials.textContent = getInitials(userProfile.email);
    } else {
      avatarInitials.textContent = "U";
    }
  }

  if (userDisplayName) {
    if (userProfile && userProfile.display_name) {
      userDisplayName.textContent = userProfile.display_name;
    } else if (userProfile && userProfile.email) {
      userDisplayName.textContent = userProfile.email;
    } else {
      userDisplayName.textContent = "User";
    }
  }
}

// Setup logout functionality
function setupLogout() {
  // Setup logout for avatar click menu (if exists)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Setup logout for any logout links
  const logoutLinks = document.querySelectorAll("[data-action='logout']");
  logoutLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });
}

// Helper function to get initials
function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Toggle user dropdown
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdownMenu");
  if (dropdown) {
    dropdown.style.display =
      dropdown.style.display === "none" ? "block" : "none";
  }
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("userDropdownMenu");
  const avatar = document.getElementById("userAvatarBtn");

  if (
    dropdown &&
    avatar &&
    !avatar.contains(e.target) &&
    !dropdown.contains(e.target)
  ) {
    dropdown.style.display = "none";
  }
});

// Clear all authentication data (for testing)
function clearAllAuthData() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userType");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("userEmail");
  console.log("All auth data cleared");
  updateNavigationState();
}

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app");

  // Initialize navigation state immediately
  updateNavigationState();

  // Setup logout functionality
  setupLogout();

  // Setup header scroll effect
  const header = document.querySelector(".header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 0) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  // Setup mobile navigation toggle
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      navToggle.classList.toggle("active");
    });
  }

  // Setup form handlers for any forms on the page
  const forms = document.querySelectorAll("form[id]");
  forms.forEach((form) => {
    // Add form handler if it doesn't already exist
    if (!form.formHandler) {
      form.formHandler = new FormHandler(form);
      console.log(`FormHandler attached to form: ${form.id}`);
    }
  });

  // Initialize page-specific functionality
  const currentPage = window.location.pathname;

  if (currentPage.includes("login.html")) {
    initializeLoginPage();
  } else if (currentPage.includes("signup.html")) {
    initializeSignupPage();
  } else if (currentPage.includes("upload.html")) {
    initializeUploadPage();
  } else if (currentPage.includes("dashboard.html")) {
    initializeDashboardPage();
  } else if (currentPage.includes("index.html") || currentPage === "/") {
    initializeHomePage();
  }

  // Debug: Log current auth state
  const token = localStorage.getItem("authToken");
  console.log("Current auth token:", !!token);
  console.log("Navigation state initialized");
});

// Page-specific initialization functions
function initializeLoginPage() {
  console.log("Initializing login page");

  // Password toggle functionality
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;

      // Update icon (implementation already exists in login.html)
    });
  }
}

function initializeSignupPage() {
  console.log("Initializing signup page");

  // Account type selection functionality
  const accountTypeButtons = document.querySelectorAll(
    ".account-type-option[data-type]"
  );

  accountTypeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      accountTypeButtons.forEach((btn) => btn.classList.remove("active"));

      // Add active class to clicked button
      button.classList.add("active");

      // Update form based on selection
      const accountType = button.dataset.type;
      const creatorFields = document.getElementById("creatorFields");

      if (accountType === "creator" && creatorFields) {
        creatorFields.style.display = "block";
        creatorFields.classList.add("visible");
      } else if (creatorFields) {
        creatorFields.style.display = "none";
        creatorFields.classList.remove("visible");
      }
    });
  });
}

function initializeUploadPage() {
  console.log("Initializing upload page");

  // Check if user is logged in and is a creator
  const token = localStorage.getItem("authToken");
  const userType = localStorage.getItem("userType");

  if (!token) {
    Utils.showNotification("Please log in to upload products", "warning");
    setTimeout(() => {
      window.location.href = "login.html?redirect=upload.html";
    }, 2000);
    return;
  }

  if (userType !== "creator") {
    Utils.showNotification("Only creators can upload products", "error");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 2000);
    return;
  }

  // Initialize file upload areas
  const fileUploadArea = document.getElementById("fileUploadArea");
  const imageUploadArea = document.getElementById("imageUploadArea");

  if (fileUploadArea) {
    window.productFileUpload = new FileUpload(fileUploadArea, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: [
        ".pdf",
        ".zip",
        ".mp4",
        ".mp3",
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
      ],
      onFilesSelected: (files) => {
        console.log("Product file selected:", files[0]);
        fileUploadArea.selectedFile = files[0];

        // Update UI to show file selected
        window.productFileUpload.showFileSelected(files[0]);
      },
    });
  }

  if (imageUploadArea) {
    window.productImageUpload = new FileUpload(imageUploadArea, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      onFilesSelected: (files) => {
        console.log("Product image selected:", files[0]);
        imageUploadArea.selectedFile = files[0];

        // Update UI to show image selected
        window.productImageUpload.showFileSelected(files[0]);
      },
    });
  }
}

function initializeDashboardPage() {
  console.log("Initializing dashboard page");

  // Dashboard initialization is already handled in dashboard.html
  // This is just a placeholder for additional dashboard-specific JS
}

function initializeHomePage() {
  console.log("Initializing home page");

  // Initialize any CTA button interactions
  const ctaButtons = document.querySelectorAll(
    '.btn[href*="signup"], .btn[href*="marketplace"]'
  );

  ctaButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Check if user is already logged in for signup buttons
      if (button.href.includes("signup") && localStorage.getItem("authToken")) {
        e.preventDefault();
        window.location.href = "dashboard.html";
      }
    });
  });
}

// Export for use in other files
window.VaultureAPI = VaultureAPI;
window.Utils = Utils;
window.FormHandler = FormHandler;
window.Modal = Modal;
window.FileUpload = FileUpload;
window.api = api;
window.logout = logout;
window.updateNavigationState = updateNavigationState;
window.clearAuthData = clearAuthData;
window.toggleUserDropdown = toggleUserDropdown;
window.clearAllAuthData = clearAllAuthData;
