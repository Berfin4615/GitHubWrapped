import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [sp] = useSearchParams();
  const nav = useNavigate();

  useEffect(() => {
    const token = sp.get("token");

    if (!token) {
      nav("/", { replace: true });
      return;
    }

    localStorage.setItem("app_token", token);

    setTimeout(() => {
      nav("/dashboard", { replace: true });
    }, 50);
  }, [sp, nav]);

  return (
    <div style={{ padding: 24, color: "white" }}>
      Redirecting to dashboard...
    </div>
  );
}
