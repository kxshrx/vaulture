"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ButtonLoading } from "@/components/ui/Loading";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Edit,
  Star,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Check,
  Globe,
  Twitter,
  Instagram,
  Linkedin,
  Github,
} from "lucide-react";

export default function ProfilePage() {
  const {
    user,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    upgradeToCreator,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    website: "",
    location: "",
    socialLinks: {
      twitter: "",
      instagram: "",
      linkedin: "",
      github: "",
    },
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Load user profile data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        website: user.website || "",
        location: user.location || "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          instagram: user.socialLinks?.instagram || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
        },
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await updateProfile(profileData);

      if (result.success) {
        setMessage("Profile updated successfully!");

        // Refresh the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData);

      if (result.success) {
        setMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();

      if (result.success) {
        alert("Account deleted successfully. You will be logged out.");
        logout();
      } else {
        setError(result.error || "Failed to delete account");
      }
    } catch (err) {
      setError("Failed to delete account. Please try again.");
    }
  };

  const handleUpgradeToCreator = async () => {
    try {
      const result = await upgradeToCreator();

      if (result.success) {
        alert(
          "Congratulations! You're now a Creator. Redirecting to your Creator Dashboard..."
        );

        // Redirect to creator dashboard
        setTimeout(() => {
          window.location.href = "/creator/dashboard";
        }, 1000);
      } else {
        alert(result.error || "Upgrade failed. Please try again.");
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Upgrade failed. Please try again.");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "password", label: "Password", icon: Shield },
    { id: "account", label: "Account", icon: Mail },
  ];

  return (
    <ProtectedRoute requireAuth={true}>
      <PageContainer>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {user?.name || "Profile Settings"}
                    </h1>
                    <p className="text-gray-600 text-lg">
                      Manage your account settings and preferences
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {user?.email}
                  </span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {user?.role?.charAt(0).toUpperCase() +
                      user?.role?.slice(1) || "Buyer"}
                  </span>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center shadow-sm">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-green-700 font-medium">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center shadow-sm">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <Card className="shadow-sm border-gray-200">
                  <CardContent className="p-0">
                    <div className="space-y-2 p-2">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                              activeTab === tab.id
                                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Upgrade to Creator CTA (only for buyers) */}
                {user?.role === "buyer" && (
                  <Card className="mt-6 bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 border-primary-300 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          Become a Creator
                        </h3>
                        <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                          Start selling your digital products and earn money
                          with our powerful platform
                        </p>
                        <Button
                          variant="primary"
                          onClick={handleUpgradeToCreator}
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          Upgrade Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <p className="text-xs text-gray-500 mt-3">
                          Free to upgrade • 5% commission only
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* General Tab */}
                {activeTab === "general" && (
                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            General Information
                          </h2>
                          <p className="text-gray-600">
                            Update your basic profile information
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              required
                              placeholder="Enter your full name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  email: e.target.value,
                                })
                              }
                              required
                              placeholder="Enter your email"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Bio
                          </label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                bio: e.target.value,
                              })
                            }
                            placeholder="Tell us about yourself..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              Share a bit about yourself to help others know you
                              better
                            </p>
                            <p className="text-xs text-gray-500">
                              {profileData.bio.length}/500
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Website
                            </label>
                            <input
                              type="url"
                              value={profileData.website}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  website: e.target.value,
                                })
                              }
                              placeholder="https://yourwebsite.com"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                              Location
                            </label>
                            <input
                              type="text"
                              value={profileData.location}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  location: e.target.value,
                                })
                              }
                              placeholder="City, Country"
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Social Links
                          </h3>
                          <p className="text-gray-600 text-sm mb-6">
                            Connect your social media profiles to build trust
                            with customers
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Twitter className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="@username"
                                value={profileData.socialLinks.twitter}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    socialLinks: {
                                      ...profileData.socialLinks,
                                      twitter: e.target.value,
                                    },
                                  })
                                }
                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Instagram className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="@username"
                                value={profileData.socialLinks.instagram}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    socialLinks: {
                                      ...profileData.socialLinks,
                                      instagram: e.target.value,
                                    },
                                  })
                                }
                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Linkedin className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="linkedin.com/in/username"
                                value={profileData.socialLinks.linkedin}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    socialLinks: {
                                      ...profileData.socialLinks,
                                      linkedin: e.target.value,
                                    },
                                  })
                                }
                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>

                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Github className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                placeholder="github.com/username"
                                value={profileData.socialLinks.github}
                                onChange={(e) =>
                                  setProfileData({
                                    ...profileData,
                                    socialLinks: {
                                      ...profileData.socialLinks,
                                      github: e.target.value,
                                    },
                                  })
                                }
                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {isLoading ? <ButtonLoading /> : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                  <Card className="shadow-sm border-gray-200">
                    <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Change Password
                          </h2>
                          <p className="text-gray-600">
                            Update your password to keep your account secure
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-6"
                      >
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                          </label>
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                currentPassword: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter your current password"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                current: !showPasswords.current,
                              })
                            }
                            className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value,
                              })
                            }
                            required
                            placeholder="Enter your new password"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                new: !showPasswords.new,
                              })
                            }
                            className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            placeholder="Confirm your new password"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                confirm: !showPasswords.confirm,
                              })
                            }
                            className="absolute right-4 top-11 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-blue-900 mb-2">
                                Password Requirements:
                              </h4>
                              <ul className="text-sm text-blue-700 space-y-1">
                                <li className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                  <span>At least 8 characters long</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                  <span>Contains both letters and numbers</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                  <span>
                                    Include special characters for better
                                    security
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-200">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {isLoading ? <ButtonLoading /> : "Change Password"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="space-y-6">
                    {/* Account Info */}
                    <Card className="shadow-sm border-gray-200">
                      <CardHeader className="bg-gray-50 rounded-t-xl border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              Account Information
                            </h2>
                            <p className="text-gray-600">
                              Your account details and membership information
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-primary-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  Account Type
                                </p>
                                <p className="text-gray-600">
                                  Your current membership level
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    user?.role === "creator"
                                      ? "bg-primary-100 text-primary-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {user?.role?.charAt(0).toUpperCase() +
                                    user?.role?.slice(1) || "Buyer"}
                                </span>
                              </div>
                              <p className="text-sm text-green-600 mt-1">
                                Active
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-4 border-b border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Mail className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  Email Address
                                </p>
                                <p className="text-gray-600">
                                  Your login email address
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-lg">
                                {user?.email}
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Check className="w-4 h-4 text-green-600" />
                                <p className="text-sm text-green-600">
                                  Verified
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-4">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  Member Since
                                </p>
                                <p className="text-gray-600">
                                  Your account creation date
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 text-lg">
                                {new Date().toLocaleDateString("en-US", {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {Math.floor(Math.random() * 30) + 1} days ago
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Statistics Card (for creators) */}
                    {user?.role === "creator" && (
                      <Card className="shadow-sm border-gray-200 bg-gradient-to-br from-primary-50 to-primary-100">
                        <CardContent className="p-8">
                          <h3 className="text-lg font-bold text-gray-900 mb-6">
                            Quick Stats
                          </h3>
                          <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-600">
                                12
                              </div>
                              <div className="text-sm text-gray-600">
                                Products
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-600">
                                $2,340
                              </div>
                              <div className="text-sm text-gray-600">
                                Revenue
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary-600">
                                89
                              </div>
                              <div className="text-sm text-gray-600">Sales</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Danger Zone */}
                    <Card className="border-red-300 shadow-sm">
                      <CardHeader className="bg-red-50 rounded-t-xl border-b border-red-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-red-900">
                              Danger Zone
                            </h2>
                            <p className="text-red-700">
                              These actions cannot be undone. Please be careful.
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="space-y-4">
                          <div className="p-6 border border-red-300 rounded-xl bg-red-50">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-bold text-red-900 mb-2 text-lg">
                                  Delete Account
                                </h3>
                                <p className="text-red-700 mb-4 leading-relaxed">
                                  Permanently delete your account and all
                                  associated data. This action cannot be undone
                                  and you will lose access to all your
                                  purchases, products, and data.
                                </p>
                                <ul className="text-sm text-red-600 space-y-1">
                                  <li>
                                    • All your personal data will be deleted
                                  </li>
                                  <li>• Purchase history will be removed</li>
                                  <li>
                                    • Downloaded files will remain accessible
                                    for 30 days
                                  </li>
                                  <li>
                                    • Active subscriptions will be cancelled
                                  </li>
                                </ul>
                              </div>
                              <Button
                                variant="danger"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="ml-6 bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Account
                </h3>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you absolutely sure you want to delete your account? This
                action cannot be undone and you will lose access to all your
                purchases and data.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 shadow-lg"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </ProtectedRoute>
  );
}
