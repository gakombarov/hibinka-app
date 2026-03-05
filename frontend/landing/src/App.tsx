import React, { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";

import { getDesignTokens } from "@shared/theme/theme";
import { Modal } from "@shared/components/ui/Modal"; 

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LoginForm } from "./features/auth/LoginForm";
import { LandingPage } from "./pages/LandingPage";
import { DashboardStub } from "./pages/DashboardStub";

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
    dispatch(logout()); 
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        
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
            
            {/* Закрытая зона */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardStub />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Box>

        <Footer />

        <Modal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} title="Вход в систему">
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