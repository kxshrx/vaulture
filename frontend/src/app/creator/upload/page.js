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
import { PREDEFINED_CATEGORIES, creatorApi, mapToBackendCategory } from "@/lib/api";
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
      } else if (typeof error.data === 'string') {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload New Product
            </h1>
            <p className="text-gray-600">
              Add a new digital product to your marketplace
            </p>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
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
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Product File
                </h2>
              </CardHeader>
              <CardContent>
                <div
                  className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-colors
                  ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
                  }
                  ${errors.productFile ? "border-red-500" : ""}
                `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  {formData.productFile ? (
                    <div className="flex items-center justify-center space-x-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formData.productFile.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(formData.productFile.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
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
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your product file here
                      </p>
                      <p className="text-gray-600 mb-4">
                        or click to browse files
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                        id="product-file"
                        accept=".zip,.rar,.pdf,.psd,.ai,.sketch,.fig,.mp4,.mp3,.wav,.jpg,.png,.svg"
                      />
                      <label htmlFor="product-file">
                        <Button type="button" variant="secondary">
                          Choose File
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                {errors.productFile && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.productFile}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-600">
                  Supported formats: ZIP, RAR, PDF, PSD, AI, Sketch, Figma, MP4,
                  MP3, WAV, JPG, PNG, SVG
                </p>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Product Images (Optional)
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
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
                        className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-gray-400" />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Add up to 5 images to showcase your product. First image will
                  be the main thumbnail.
                </p>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pricing
                </h2>
              </CardHeader>
              <CardContent>
                <div className="max-w-md">
                  <Input
                    label="Price (USD)"
                    name="price"
                    type="number"
                    min="0.99"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    error={errors.price}
                    placeholder="29.99"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Minimum price is $0.99. Platform fee: 5% + payment
                    processing fees.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Progress */}
            {loading && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      Uploading Product...
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
              >
                Save as Draft
              </Button>
              <Button type="submit" variant="pink" disabled={loading}>
                Publish Product
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
