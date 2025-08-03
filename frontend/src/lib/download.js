/**
 * Utility functions for secure file downloads
 */

/**
 * SECURE DOWNLOAD: Handle both Supabase signed URLs and local storage URLs
 */
export const downloadFileWithAuth = async (url, filename) => {
  try {
    const token = localStorage.getItem("vaulture_token");

    if (!token) {
      throw new Error("Authentication required for file download");
    }

    // Check if this is a Supabase URL (cloud storage)
    const isSupabaseUrl = url.includes(".supabase.co/storage/v1/object/sign/");

    if (isSupabaseUrl) {
      // For Supabase URLs, use direct download (already authenticated by backend)
      console.log("🔗 Using Supabase direct download");

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "download";
      link.style.display = "none";

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    }

    // For local storage URLs, use the secure download approach
    console.log("🔒 Using local secure download");

    // Parse the signed URL to extract parameters
    const urlObj = new URL(url);
    const token_param = urlObj.searchParams.get("token");
    const expires = urlObj.searchParams.get("expires");

    // Verify the signed URL is still valid
    const currentTime = Math.floor(Date.now() / 1000);
    if (expires && currentTime > parseInt(expires)) {
      throw new Error(
        "Download link has expired. Please request a new download."
      );
    }

    // Create a form to submit with authentication
    // This preserves the signed URL security while including auth
    const form = document.createElement("form");
    form.method = "POST";
    form.action =
      url.replace("/files/", "/secure-download/") +
      `?token=${token_param}&expires=${expires}`;
    form.style.display = "none";
    form.target = "_blank"; // Open in new tab for download

    // Add auth token as hidden field
    const tokenField = document.createElement("input");
    tokenField.type = "hidden";
    tokenField.name = "auth_token";
    tokenField.value = token;
    form.appendChild(tokenField);

    // Add filename field
    const filenameField = document.createElement("input");
    filenameField.type = "hidden";
    filenameField.name = "filename";
    filenameField.value = filename || "download";
    form.appendChild(filenameField);

    // Submit form to trigger download
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    return true;
  } catch (error) {
    console.error("Secure download failed:", error);

    // Fallback to blob download if signed URL approach fails
    return await downloadFileWithAuthFallback(url, filename, error);
  }
};

/**
 * Fallback: Direct blob download with authentication
 * Used when signed URL approach fails
 */
const downloadFileWithAuthFallback = async (url, filename, originalError) => {
  try {
    const token = localStorage.getItem("vaulture_token");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (response.status === 403) {
        throw new Error(
          "Access denied. You don't have permission to download this file."
        );
      } else if (response.status === 404) {
        throw new Error("File not found or has been removed.");
      } else {
        throw new Error(`Download failed: ${response.statusText}`);
      }
    }

    // Get the blob data
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = filename || "download";

    // Add to DOM, click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the blob URL
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);

    return true;
  } catch (error) {
    console.error("Secure download failed:", error);
    throw error;
  }
};

/**
 * Show download success notification
 */
export const showDownloadNotification = (
  message = "Download started successfully!"
) => {
  const successMessage = document.createElement("div");
  successMessage.className =
    "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-0";
  successMessage.textContent = message;
  document.body.appendChild(successMessage);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (document.body.contains(successMessage)) {
      successMessage.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 300);
    }
  }, 3000);
};

/**
 * Show download error notification
 */
export const showDownloadError = (
  message = "Download failed. Please try again."
) => {
  const errorMessage = document.createElement("div");
  errorMessage.className =
    "fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all transform translate-x-0";
  errorMessage.textContent = message;
  document.body.appendChild(errorMessage);

  // Auto remove after 5 seconds (longer for error messages)
  setTimeout(() => {
    if (document.body.contains(errorMessage)) {
      errorMessage.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 300);
    }
  }, 5000);
};
