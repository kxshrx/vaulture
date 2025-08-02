export function Card({ children, className = "", hover = false, ...props }) {
  const baseClasses = "bg-white border border-gray-200 rounded-lg shadow-sm";
  const hoverClasses = hover
    ? "transition-all duration-150 hover:shadow-lg hover:border-gray-300 cursor-pointer"
    : "";

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
