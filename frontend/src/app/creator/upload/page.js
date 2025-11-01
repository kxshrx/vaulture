"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  PREDEFINED_CATEGORIES,
  creatorApi,
  mapToBackendCategory,
} from "@/lib/api";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  DollarSign,
  Plus,
} from "lucide-react";

export default function ProductUpload() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    price: "",
    productFile: null,
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileUpload = (files, type = "product") => {
    if (type === "product") {
      setFormData((prev) => ({ ...prev, productFile: files[0] }));
    } else {
      const newImages = Array.from(files).slice(0, 5 - formData.images.length);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Product title is required";
    if (!formData.description.trim())
      newErrors.description = "Product description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.productFile)
      newErrors.productFile = "Product file is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();

    if (!isDraft && !validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Debug logging
      console.log("Current user:", user);
      console.log("Auth token:", localStorage.getItem("vaulture_token"));

      // Prepare upload data
      const uploadData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: mapToBackendCategory(formData.category),
        tags: formData.tags,
        file: formData.productFile, // Main product file
      };

      // Add first image as preview image if available
      if (formData.images.length > 0) {
        uploadData.image = formData.images[0];
      }

      console.log("Upload data:", uploadData);

      // Simulate upload progress
      setUploadProgress(20);

      // Call the API
      const result = await creatorApi.uploadFile(uploadData);

      setUploadProgress(100);

      console.log("Product uploaded successfully:", result);

      // Redirect to products management
      router.push("/creator/products");
    } catch (error) {
      console.error("Upload failed:", error);

      let errorMessage = "Unknown error";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data && error.data.detail) {
        errorMessage = error.data.detail;
      } else if (typeof error.data === "string") {
        errorMessage = error.data;
      }

      alert("Upload failed. Please try again: " + errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <ProtectedRoute requireAuth={true} requiredRole="creator">
      <PageContainer>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Upload New Product
            </h1>
            <p className="text-gray-300 text-lg">
              Add a new digital product to your marketplace
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Product Details */}
            <Card hover>
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-neon-500" />
                  Product Details
                </h2>
              </CardHeader>
              <CardContent className="space-y-6">
                <Input
                  label="Product Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={errors.title}
                  placeholder="Enter a compelling product title"
                  required
                />

                <Textarea
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  error={errors.description}
                  placeholder="Describe your product in detail. What does it include? How will it help buyers?"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`
                      w-full px-3 py-2 border rounded-lg transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.category ? "border-red-500" : "border-gray-300"}
                    `}
                    >
                      <option value="">Select a category</option>
                      {PREDEFINED_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.category}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Tags (comma separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="design, template, ui, modern"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card hover className="border-2 border-neon-500/30 hover:border-neon-500/50 transition-colors">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-10 h-10 bg-dark-500 rounded-xl flex items-center justify-center mr-3">
                    <Upload className="w-5 h-5 text-neon-500" />
                  </div>
                  Product File
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Upload the main digital product file that buyers will download
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className={`
                  border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200
                  ${
                    dragActive
                      ? "border-primary-500 bg-primary-50 scale-[1.02]"
                      : "border-gray-300 hover:border-primary-300 hover:bg-gray-50"
                  }
                  ${errors.productFile ? "border-red-500 bg-red-50" : ""}
                `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {formData.productFile ? (
                    <div className="flex items-center justify-center space-x-6 bg-white rounded-xl p-6 shadow-sm">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900 text-lg">
                          {formData.productFile.name}
                        </p>
                        <p className="text-gray-600 mt-1">
                          {(formData.productFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB • Ready to upload
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productFile: null,
                          }))
                        }
                        className="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Upload className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="text-xl font-semibold text-gray-900 mb-2">
                        Drop your product file here
                      </p>
                      <p className="text-gray-600 mb-6">
                        or click the button below to browse
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="product-file"
                        accept=".zip,.rar,.pdf,.psd,.ai,.sketch,.fig,.mp4,.mp3,.wav,.jpg,.png,.svg"
                      />
                      <label htmlFor="product-file">
                        <Button 
                          type="button" 
                          variant="primary"
                          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                {errors.productFile && (
                  <p className="mt-3 text-sm text-red-600 font-medium flex items-center">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                    {errors.productFile}
                  </p>
                )}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Supported formats:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['ZIP', 'RAR', 'PDF', 'PSD', 'AI', 'Sketch', 'Figma', 'MP4', 'MP3', 'WAV', 'JPG', 'PNG', 'SVG'].map(format => (
                      <span key={format} className="px-3 py-1 bg-white text-gray-700 text-xs font-medium rounded-lg border border-gray-200">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card hover className="border-2 border-neon-500/30 hover:border-neon-500/50 transition-colors">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-10 h-10 bg-dark-500 rounded-xl flex items-center justify-center mr-3">
                    <ImageIcon className="w-5 h-5 text-neon-500" />
                  </div>
                  Product Images (Optional)
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Add preview images to showcase your product
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-gray-200 group-hover:border-primary-300 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-all transform scale-90 group-hover:scale-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                          Main
                        </span>
                      )}
                    </div>
                  ))}

                  {formData.images.length < 5 && (
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          handleFileUpload(e.target.files, "images")
                        }
                        className="hidden"
                        id="product-images"
                        accept="image/*"
                      />
                      <label
                        htmlFor="product-images"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-gray-100 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-2 transition-colors">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" />
                        </div>
                        <span className="text-xs text-gray-500 group-hover:text-primary-600 font-medium transition-colors">
                          Add Image
                        </span>
                      </label>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-900 font-medium mb-1">
                    📸 Image Guidelines
                  </p>
                  <p className="text-sm text-purple-800">
                    Add up to 5 images. The first image will be used as your main thumbnail. Use high-quality images (at least 800x600px) for best results.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card hover className="border-2 border-neon-500/30 hover:border-neon-500/50 transition-colors">
              <CardHeader>
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-10 h-10 bg-dark-500 rounded-xl flex items-center justify-center mr-3">
                    <DollarSign className="w-5 h-5 text-neon-500" />
                  </div>
                  Pricing
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Set a fair price for your digital product
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                    <Input
                      label="Price (₹ INR)"
                      name="price"
                      type="number"
                      min="83"
                      step="1"
                      value={formData.price ? Math.round(formData.price * 83) : ''}
                      onChange={(e) => {
                        const inrValue = parseFloat(e.target.value) || 0;
                        const usdValue = (inrValue / 83).toFixed(2);
                        handleInputChange({
                          target: { name: 'price', value: usdValue }
                        });
                      }}
                      error={errors.price}
                      placeholder="2490"
                      required
                    />
                    
                    {formData.price && (
                      <div className="mt-4 space-y-3 bg-white rounded-xl p-4 border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">USD Equivalent</span>
                          <span className="text-lg font-bold text-gray-900">${formData.price}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                          <span className="text-sm text-gray-600">Your Earnings (after fees)</span>
                          <span className="text-lg font-bold text-green-600">${(formData.price * 0.95).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-900 font-medium mb-2">💡 Pricing Tips</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Minimum price: ₹83 ($0.99 USD)</li>
                      <li>• Platform fee: 5% + payment processing fees</li>
                      <li>• Research similar products for competitive pricing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {loading && (
              <Card className="border-2 border-neon-500 shadow-neon">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-dark-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <Upload className="w-8 h-8 text-neon-500" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">
                      Uploading Your Product...
                    </p>
                    <p className="text-gray-300 mb-6">Please wait while we process your files</p>
                    <div className="w-full bg-dark-500 rounded-full h-3 mb-4 overflow-hidden">
                      <div
                        className="bg-neon-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden shadow-neon-sm"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-neon-500">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t-2 border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="border-2 hover:border-gray-400 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Publish Product
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
