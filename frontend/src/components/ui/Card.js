export function Card({ children, className = "", hover = false, ...props }) {
  const baseClasses = "bg-dark-400 border border-dark-300 rounded-lg shadow-card";
  const hoverClasses = hover
    ? "transition-all duration-300 hover:shadow-elevated hover:border-neon-500/50 cursor-pointer card-hover"
    : "";

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-b border-dark-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`px-6 py-4 border-t border-dark-300 ${className}`}>
      {children}
    </div>
  );
}
