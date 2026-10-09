import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react"; // O los íconos que estés usando

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function PasswordInput({ icon = <Lock size={18} />, placeholder, className = "", ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative flex items-center w-full">
      {icon && (
        <span className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center justify-center">
          {icon}
        </span>
      )}
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...props}
        className={`w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground placeholder:font-light focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3.5 text-muted-foreground hover:text-foreground focus:outline-none flex items-center justify-center"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}