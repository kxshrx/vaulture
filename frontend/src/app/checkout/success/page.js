"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { purchaseApi, buyerApi } from "@/lib/api";
import {
  CheckCircle,
  Download,
  Package,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Clock,
} from "lucide-react";

export default function CheckoutSuccessPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingProductId, setDownloadingProductId] = useState(null);
  const [pollFailed, setPollFailed] = useState(false);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId && user) {
      verifyPurchase();

      // Set up polling with a maximum of 10 attempts (30 seconds)
      let pollCount = 0;
      const maxPolls = 10;

      const pollInterval = setInterval(() => {
        pollCount++;

        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          console.log("Max polling attempts reached");
          if (!purchase || purchase.payment_status === "pending") {
            setPollFailed(true);
            setError(
              "Payment verification is taking longer than expected. Please check your dashboard or contact support."
            );
          }
          return;
        }

        if (!purchase || purchase.payment_status === "pending") {
          console.log(`Polling attempt ${pollCount}/${maxPolls}`);
          verifyPurchase();
        } else {
          clearInterval(pollInterval);
        }
      }, 3000);

      return () => {
        clearInterval(pollInterval);
      };
    } else if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
    }
  }, [sessionId, user]);

  const verifyPurchase = async () => {
    try {
      setLoading((prev) => (!purchase ? true : false)); // Only show loading for initial load
      setError("");

      // First try to get the purchase by session
      let purchaseData;
      try {
        purchaseData = await purchaseApi.getPurchaseBySession(sessionId);
        console.log("Purchase found:", purchaseData);
      } catch (err) {
        // If not found, try to verify with Stripe
        console.log("Purchase not found, verifying with Stripe...");
        try {
          purchaseData = await purchaseApi.verifyPurchase(sessionId);
        } catch (verifyErr) {
          // If both fail, just log and wait for webhook
          console.log("Verification failed, waiting for webhook processing...");
          if (!purchase) {
            setError("Processing your payment... Please wait a moment.");
          }
          return;
        }
      }

      setPurchase(purchaseData);

      // If payment is completed, redirect to dashboard with success flag
      if (purchaseData && purchaseData.payment_status === "completed") {
        setTimeout(() => {
          router.push(
            `/dashboard?purchase=success&download=${purchaseData.product_id}`
          );
        }, 2000);
      }
    } catch (err) {
      console.error("Error verifying purchase:", err);
      if (!purchase) {
        setError(
          "Processing your payment... If this takes too long, please check your dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!purchase) return;

    try {
      setDownloadingProductId(purchase.product_id);

      const response = await buyerApi.downloadProduct(purchase.product_id);

      // Open the download URL in a new tab
      window.open(response.download_url, "_blank");

      // Show success message
      const successMessage = document.createElement("div");
      successMessage.className =
        "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      successMessage.textContent = "Download started successfully!";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again from your dashboard.");
    } finally {
      setDownloadingProductId(null);
    }
  };

  const handleManualVerify = async () => {
    try {
      setLoading(true);
      setError("");
      const purchaseData = await purchaseApi.verifyPurchase(sessionId);
      setPurchase(purchaseData);
      setPollFailed(false);
    } catch (err) {
      console.error("Manual verification failed:", err);
      setError(
        "Verification failed. Please check your dashboard or contact support."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <PageContainer>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verifying Your Purchase...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your payment
              </p>
            </div>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  if (error && !purchase) {
    return (
      <ProtectedRoute requireAuth={true}>
        <PageContainer>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  Processing Your Payment
                </h2>
                <p className="text-blue-700 mb-6">{error}</p>
                <div className="animate-pulse">
                  <div className="h-2 bg-blue-200 rounded-full mb-4"></div>
                  <p className="text-sm text-blue-600">
                    This usually takes just a few seconds...
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  <Link href="/dashboard">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      <Package className="w-4 h-4 mr-2" />
                      Check My Dashboard
                    </Button>
                  </Link>
                  <div className="text-sm text-gray-600">
                    Session ID:{" "}
                    <code className="bg-gray-200 px-2 py-1 rounded">
                      {sessionId}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <PageContainer>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Success Message */}
          {purchase && purchase.payment_status === "completed" ? (
            <Card className="border-green-200 bg-green-50 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-green-900 mb-4">
                  Purchase Successful!
                </h1>
                <p className="text-green-700 text-lg mb-6">
                  Thank you for your purchase. Your digital product is ready for
                  download.
                </p>

                <div className="bg-white border border-green-200 rounded-lg p-6 mb-6">
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Purchase Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Product:</span>
                        <span className="font-medium text-gray-900">
                          {purchase.product_title || "Digital Product"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium text-gray-900">
                          ${purchase.amount_paid?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Purchase Date:</span>
                        <span className="font-medium text-gray-900">
                          {purchase.completed_at
                            ? new Date(
                                purchase.completed_at
                              ).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handleDownload}
                    disabled={downloadingProductId === purchase.product_id}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {downloadingProductId === purchase.product_id ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Now
                      </>
                    )}
                  </Button>

                  <Link href="/dashboard">
                    <Button
                      variant="secondary"
                      size="large"
                      className="w-full sm:w-auto"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      View My Purchases
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (purchase && purchase.payment_status === "pending") ||
            pollFailed ? (
            <Card className="border-yellow-200 bg-yellow-50 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-yellow-600" />
                </div>
                <h1 className="text-3xl font-bold text-yellow-900 mb-4">
                  {pollFailed
                    ? "Payment Verification Needed"
                    : "Payment Processing..."}
                </h1>
                <p className="text-yellow-700 text-lg mb-6">
                  {pollFailed
                    ? "Your payment may have completed but we need to verify it manually."
                    : "We're confirming your payment. This usually takes just a few seconds."}
                </p>

                {!pollFailed ? (
                  <div className="animate-pulse mb-6">
                    <div className="h-2 bg-yellow-200 rounded-full mb-4"></div>
                    <p className="text-sm text-yellow-600">
                      Please don't close this page. Your purchase will appear
                      once confirmed.
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="text-sm text-yellow-600 mb-4">
                      Click the button below to manually verify your payment, or
                      check your dashboard.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {pollFailed && (
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleManualVerify}
                      disabled={loading}
                      className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          Verify Payment
                        </>
                      )}
                    </Button>
                  )}
                  <Link href="/dashboard">
                    <Button
                      variant="secondary"
                      size="large"
                      className="w-full sm:w-auto"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      Check My Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : purchase && purchase.payment_status === "failed" ? (
            <Card className="border-red-200 bg-red-50 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-red-900 mb-4">
                  Payment Failed
                </h1>
                <p className="text-red-700 text-lg mb-6">
                  Unfortunately, your payment could not be processed.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button
                      variant="primary"
                      size="large"
                      className="w-full sm:w-auto"
                    >
                      Try Again
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="secondary"
                      size="large"
                      className="w-full sm:w-auto"
                    >
                      <Package className="w-5 h-5 mr-2" />
                      My Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-blue-200 bg-blue-50 mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-blue-900 mb-4">
                  Verifying Payment...
                </h1>
                <p className="text-blue-700 text-lg mb-6">
                  We're processing your payment. Please wait a moment.
                </p>

                <div className="animate-pulse mb-6">
                  <div className="h-2 bg-blue-200 rounded-full mb-4"></div>
                  <p className="text-sm text-blue-600">
                    This page will update automatically once your payment is
                    confirmed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Information */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Important Information
              </h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Secure Download:</strong>{" "}
                    Your download link will expire in 45 seconds for security
                    purposes.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Re-download:</strong> You
                    can re-download your products anytime from your dashboard.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong className="text-gray-900">Support:</strong> Need
                    help? Contact us with your session ID:
                    <code className="bg-gray-100 px-2 py-1 rounded ml-1 text-xs">
                      {sessionId}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Next?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button variant="ghost" className="flex items-center">
                  Browse More Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {purchase?.creator_id && (
                <Link href={`/creator/${purchase.creator_id}`}>
                  <Button variant="ghost" className="flex items-center">
                    View Creator Profile
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
