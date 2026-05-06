import { useEffect, useState } from "react";
import { X } from "lucide-react";
import "./TopAccessNotice.css";

export default function TopAccessNotice({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="top-access-notice-shell">
      <div
        className={`top-access-notice-card ${isVisible ? "is-visible" : "is-hidden"}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="top-access-notice-body">
          <div>
            <div className="top-access-notice-kicker">
              Bitely Access
            </div>
            <p className="top-access-notice-message">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="top-access-notice-close"
            aria-label="Close notice"
          >
            <X size={16} />
          </button>
        </div>

        <div className="top-access-notice-progress-track">
          <div className="top-access-notice-progress-bar" />
        </div>
      </div>
    </div>
  );
}
