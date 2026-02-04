import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import ExchangePage from "./pages/ExchangePage";
import HistoryPage from "./pages/HistoryPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import { setOnUnauthorized } from "./services/api";
import "./styles/global.scss";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthHandler({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    setOnUnauthorized(() => {
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHandler>
          <Toast />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/exchange" element={<ExchangePage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Route>
            </Route>
            <Route path="/" element={<Navigate to="/exchange" replace />} />
            <Route path="*" element={<Navigate to="/exchange" replace />} />
          </Routes>
        </AuthHandler>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
