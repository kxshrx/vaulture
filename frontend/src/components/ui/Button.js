export function Button({
  children,
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-black text-white hover:bg-gray-800 focus:ring-gray-800 shadow-sm active:bg-gray-900",
    secondary:
      "bg-white text-black hover:bg-gray-50 focus:ring-gray-400 border border-gray-300 shadow-sm",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
    pink: "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-sm active:bg-primary-700",
    outline:
      "bg-transparent text-black hover:bg-gray-50 focus:ring-gray-400 border border-black",
    danger:
      "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-sm",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm h-8",
    medium: "px-4 py-2 text-sm h-10",
    large: "px-6 py-3 text-base h-12",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
