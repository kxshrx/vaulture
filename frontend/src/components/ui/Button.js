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
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-neon-500 text-dark-900 hover:bg-neon-400 focus:ring-neon-500 shadow-neon-sm hover:shadow-neon active:scale-95 font-bold",
    secondary:
      "bg-dark-400 text-white hover:bg-dark-300 focus:ring-dark-400 border border-dark-200 shadow-sm",
    ghost: "bg-transparent text-gray-300 hover:bg-dark-400 hover:text-neon-500 focus:ring-neon-500",
    pink: "bg-neon-500 text-dark-900 hover:bg-neon-400 focus:ring-neon-500 shadow-neon-sm hover:shadow-neon active:scale-95 font-bold",
    outline:
      "bg-transparent text-neon-500 hover:bg-neon-500/10 focus:ring-neon-500 border-2 border-neon-500 hover:border-neon-400",
    danger:
      "bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-sm active:scale-95",
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
