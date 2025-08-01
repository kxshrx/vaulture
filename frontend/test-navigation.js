// Test Navigation Script
// Run this in the browser console to test navigation states

console.log("=== Navigation Test Script ===");

// 1. Check current state
console.log("1. Current state:");
const token = localStorage.getItem("authToken");
console.log("Auth token exists:", !!token);
console.log("Token value:", token);

// 2. Check navigation elements
const loggedOutNav = document.getElementById("navLoggedOut");
const loggedInNav = document.getElementById("navLoggedIn");
console.log("Logged out nav element:", loggedOutNav);
console.log("Logged in nav element:", loggedInNav);

if (loggedOutNav) {
  console.log(
    "Logged out nav display:",
    window.getComputedStyle(loggedOutNav).display
  );
}
if (loggedInNav) {
  console.log(
    "Logged in nav display:",
    window.getComputedStyle(loggedInNav).display
  );
}

// 3. Test clearing auth data
console.log("\n2. Testing clearAuthData function:");
if (typeof clearAuthData === "function") {
  clearAuthData();
  console.log("Auth data cleared");
} else {
  console.log("clearAuthData function not found");
}

// 4. Test navigation update
console.log("\n3. Testing updateNavigationState function:");
if (typeof updateNavigationState === "function") {
  updateNavigationState();
  console.log("Navigation state updated");
} else {
  console.log("updateNavigationState function not found");
}

// 5. Final state check
setTimeout(() => {
  console.log("\n4. Final state check:");
  if (loggedOutNav) {
    console.log(
      "Logged out nav display:",
      window.getComputedStyle(loggedOutNav).display
    );
  }
  if (loggedInNav) {
    console.log(
      "Logged in nav display:",
      window.getComputedStyle(loggedInNav).display
    );
  }
}, 100);
