import { useEffect } from "react";
import { useToastStore } from "../store/useToastStore";
import "../styles/Toast.scss";

const Toast = () => {
  const { toast, hideToast } = useToastStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(hideToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      <span className="toast-icon">{toast.type === "success" ? "✓" : "✕"}</span>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
};

export default Toast;
