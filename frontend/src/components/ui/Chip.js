export function Chip({
  children,
  active = false,
  onClick,
  variant = "default",
  size = "medium",
  className = "",
}) {
  const baseClasses =
    "inline-flex items-center font-semibold rounded-lg transition-all duration-200 cursor-pointer";

  const variants = {
    default: active
      ? "bg-neon-500 text-dark-900 shadow-neon-sm"
      : "bg-dark-400 text-gray-300 hover:bg-dark-300 hover:text-neon-500 border border-dark-300",
    category: active
      ? "bg-neon-500 text-dark-900 border-2 border-neon-500 shadow-neon-sm font-bold"
      : "bg-dark-400 text-gray-300 border border-dark-300 hover:border-neon-500 hover:text-neon-500",
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
