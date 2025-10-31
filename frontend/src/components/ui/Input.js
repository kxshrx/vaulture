import { forwardRef } from "react";

export const Input = forwardRef(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
          w-full px-4 py-3 border rounded-lg transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-neon-500
          bg-dark-400 hover:bg-dark-300 border-dark-300 text-white
          placeholder:text-gray-500
          ${error ? "border-error-500 bg-error-500/10 focus:ring-error-500" : ""}
          ${className}
        `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-error-500 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
