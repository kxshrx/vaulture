export function Chip({
  children,
  active = false,
  onClick,
  variant = "default",
  size = "medium",
  className = "",
}) {
  const baseClasses =
    "inline-flex items-center font-semibold rounded-md transition-all duration-150 cursor-pointer";

  const variants = {
    default: active
      ? "bg-black text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
    category: active
      ? "bg-primary-50 text-primary-700 border border-primary-200"
      : "bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50",
  };

  const sizes = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-5 py-2.5 text-base",
  };

  return (
    <span
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
}
