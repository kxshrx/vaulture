import { forwardRef } from "react";

export const Textarea = forwardRef(
  ({ label, error, rows = 4, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-black mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
          w-full px-4 py-3 border rounded-md transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          bg-white hover:bg-gray-50 border-gray-300
          placeholder:text-gray-500 resize-vertical
          ${error ? "border-red-500 bg-red-50 focus:ring-red-500" : ""}
          ${className}
        `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
