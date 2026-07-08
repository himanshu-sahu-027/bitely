import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./auth.css";

function FloatingInput({
  label,
  type,
  value = "",
  onChange,
  containerClassName = "",
  inputClassName = "",
  enablePasswordToggle = false,
  ...inputProps
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = enablePasswordToggle && type === "password";
  const resolvedType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className={`floating-input ${containerClassName}`.trim()}>
      <input
        type={resolvedType}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className={`${inputClassName} ${isPasswordField ? "floating-input--with-toggle" : ""}`.trim()}
        {...inputProps}
      />
      <label>{label}</label>
      {isPasswordField ? (
        <button
          type="button"
          className="floating-input-toggle"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      ) : null}
    </div>
  );
}

export default FloatingInput;
