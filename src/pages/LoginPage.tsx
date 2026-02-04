import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../services/api";
import { getErrorMessage } from "../utils/errorHandler";
import "../styles/Login.scss";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if (response.data?.token) {
        localStorage.setItem("accessToken", response.data.token);
        navigate("/exchange");
      } else {
        setError("로그인에 실패했습니다.");
      }
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    loginMutation.mutate(email);
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-logo">
          <img src="/logo.png" alt="Exchange app" />
        </div>

        <h1 className="login-title">반갑습니다.</h1>
        <p className="login-subtitle">로그인 정보를 입력해주세요.</p>

        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                이메일 주소를 입력해주세요.
              </label>
              <input
                id="email"
                type="email"
                className={`form-input ${error ? "error" : ""}`}
                placeholder="test@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <span className="form-error">{error}</span>}
            </div>
            <button
              type="submit"
              className="login-btn"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인 하기"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
