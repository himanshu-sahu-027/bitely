import React from "react";
import "./auth.css";

function FloatingInput({ label, type, value = "", onChange }) {
  return (
    <div className="floating-input">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
      />
      <label>{label}</label>
    </div>
  );
}

export default FloatingInput;
