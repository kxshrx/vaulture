/**
 * SIMPLE 10-SECOND EXPIRY FILE ACCESS
 * Clean, minimal implementation - no complex anti-piracy nonsense
 */

/**
 * Main download function - handles masked file access with 10s expiry
 */
export const downloadFileWithAuth = async (url, filename) => {
  try {
    const token = localStorage.getItem("vaulture_token");

    if (!token) {
      throw new Error("Please log in to access files");
    }

    // Fix URL if it contains localhost (backend configuration issue)
    let correctedUrl = url;
    if (url.includes("localhost:8000")) {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      correctedUrl = url.replace("http://localhost:8000", API_BASE_URL);
      console.log(
        "🔧 Corrected URL from localhost to production:",
        correctedUrl
      );
    }

    // Check if this is our masked access URL
    const isMaskedAccessUrl = correctedUrl.includes("/api/access-file");

    if (isMaskedAccessUrl) {
      console.log("🎯 Accessing file (10s expiry, hidden Supabase URLs)");

      // Add token to URL for authentication in same tab
      const urlWithToken = `${correctedUrl}&token=${encodeURIComponent(token)}`;

      // Open in same tab to preserve authentication context
      window.location.href = urlWithToken;
      showFileAccessNotification();
      return true;
    }

    // Fallback: Direct URL
    console.log("⚠️ Direct URL access");
    window.open(correctedUrl, "_blank");
    return true;
  } catch (error) {
    console.error("File access failed:", error);
    throw error;
  }
};

/**
 * Simple success notification
 */
const showFileAccessNotification = () => {
  console.log("✅ File access granted (expires in 10 seconds)");
};

/**
 * Show download notification
 */
export const showDownloadNotification = () => {
  console.log("✅ Download started successfully");
  // You can replace this with a toast notification library if needed
};

/**
 * Show download error
 */
export const showDownloadError = (message) => {
  console.error("❌ Download failed:", message);
  // You can replace this with a toast notification library if needed
};

// Export the main function
export default downloadFileWithAuth;
