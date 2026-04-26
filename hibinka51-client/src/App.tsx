import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";

import { getDesignTokens } from "@shared/theme/theme";
import { Modal } from "@shared/components/ui/Modal";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginForm } from "./features/auth/LoginForm";
import { LandingPage } from "./pages/LandingPage";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { TripsJournal } from "./pages/TripsJournal";
import { BookingDetails } from "./features/bookings/BookingDetails";
import { BookingsList } from "./features/bookings/BookingsList";
import { SandboxPage } from "./pages/Sandbox/SandboxPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import type { RootState } from "./store/store";
import { logout } from "./store/authSlice";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("app_theme");
    return (savedTheme as "light" | "dark") || "light";
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("app_theme", newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    dispatch(logout());
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header
          mode={mode}
          toggleTheme={toggleTheme}
          user={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onGoToDashboard={() => navigate("/dashboard")}
          onGoToLanding={() => navigate("/")}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Наша скрытая песочница */}
            <Route path="/sandbox" element={<SandboxPage />} />

            {/* Закрытая зона (Админка с боковым меню) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Авто-редирект с /dashboard на /dashboard/trips */}
              <Route index element={<Navigate to="trips" replace />} />

              {/* Наши страницы внутри Дашборда */}
              <Route path="trips" element={<TripsJournal />} />

              {/* Автопарк */}
              <Route path="vehicles" element={<VehiclesPage />} />

              {/* Роуты для заявок с сайта*/}
              <Route path="bookings" element={<BookingsList />} />
              <Route path="bookings/:id" element={<BookingDetails />} />

              {/* Заглушки для будущих страниц */}
              <Route
                path="schedule"
                element={
                  <Box sx={{ p: 4 }}>
                    <h1>Расписание (в разработке)</h1>
                  </Box>
                }
              />
              <Route
                path="customers"
                element={
                  <Box sx={{ p: 4 }}>
                    <h1>Клиенты (в разработке)</h1>
                  </Box>
                }
              />
            </Route>
          </Routes>
        </Box>

        <Footer />

        <Modal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          title="Вход в систему"
        >
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";

import { getDesignTokens } from "@shared/theme/theme";
import { Modal } from "@shared/components/ui/Modal";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginForm } from "./features/auth/LoginForm";
import { LandingPage } from "./pages/LandingPage";

import { DashboardLayout } from "./components/layout/DashboardLayout";
import { TripsJournal } from "./pages/TripsJournal";
import { BookingDetails } from "./features/bookings/BookingDetails";
import { BookingsList } from "./features/bookings/BookingsList";
import { SandboxPage } from "./pages/Sandbox/SandboxPage";

import type { RootState } from "./store/store";
import { logout } from "./store/authSlice";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("app_theme");
    return (savedTheme as "light" | "dark") || "light";
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("app_theme", newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    dispatch(logout());
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header
          mode={mode}
          toggleTheme={toggleTheme}
          user={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onGoToDashboard={() => navigate("/dashboard")}
          onGoToLanding={() => navigate("/")}
        />

        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Наша скрытая песочница */}
            <Route path="/sandbox" element={<SandboxPage />} />

            {/* Закрытая зона (Админка с боковым меню) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Авто-редирект с /dashboard на /dashboard/trips */}
              <Route index element={<Navigate to="trips" replace />} />

              {/* Наши страницы внутри Дашборда */}
              <Route path="trips" element={<TripsJournal />} />

              {/* Роуты для заявок с сайта*/}
              <Route path="bookings" element={<BookingsList />} />
              <Route path="bookings/:id" element={<BookingDetails />} />

              {/* Заглушки для будущих страниц */}
              <Route
                path="schedule"
                element={
                  <Box sx={{ p: 4 }}>
                    <h1>Расписание (в разработке)</h1>
                  </Box>
                }
              />
              <Route
                path="customers"
                element={
                  <Box sx={{ p: 4 }}>
                    <h1>Клиенты (в разработке)</h1>
                  </Box>
                }
              />
            </Route>
          </Routes>
        </Box>

        <Footer />

        <Modal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          title="Вход в систему"
        >
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
