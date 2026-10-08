import React from "react";

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function IconInput({ icon, placeholder, className = "", ...props }: IconInputProps) {
  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        {...props}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm text-slate-800 placeholder:text-slate-400 placeholder:font-light focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all ${
          icon ? "pl-10 pr-4" : "px-4"
        } ${className}`}
      />
    </div>
  );
}