export function Loading({ size = "medium", text = "" }) {
  const sizes = {
    small: "w-4 h-4",
    medium: "w-6 h-6",
    large: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={`${sizes[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`}
      ></div>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="large" text="Loading..." />
    </div>
  );
}

export function ButtonLoading({ size = "small" }) {
  const sizes = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
  };

  return (
    <div
      className={`${sizes[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}
