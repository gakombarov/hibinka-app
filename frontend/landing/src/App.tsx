import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";

import { getDesignTokens } from "@shared/theme/theme.ts";
import { Modal } from "@shared/components/ui/Modal";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { LandingPage } from "./pages/LandingPage";
import { DashboardStub } from "./pages/DashboardStub";
import { LoginForm } from "./features/auth/LoginForm";

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<"landing" | "dashboard">(
    "landing",
  );
  const [mode, setMode] = useState<"light" | "dark">("light");

  const [user, setUser] = useState<{ name: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const toggleTheme = () =>
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  const handleLogin = () => {
    setUser({ name: "Иванов Иван" });
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRoute("landing");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Header
          mode={mode}
          toggleTheme={toggleTheme}
          user={user}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onGoToDashboard={() => setCurrentRoute("dashboard")}
          onGoToLanding={() => setCurrentRoute("landing")}
        />

        {currentRoute === "landing" ? (
          <LandingPage />
        ) : (
          <DashboardStub onBack={() => setCurrentRoute("landing")} />
        )}

        <Footer />

        <Modal
          open={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          title="Вход в систему"
        >
          <LoginForm onLogin={handleLogin} />
        </Modal>
      </Box>
    </ThemeProvider>
  );
}
