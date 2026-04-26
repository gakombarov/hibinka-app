export const getDesignTokens = (mode: "light" | "dark") => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          primary: { main: "#F4C430", contrastText: "#1a1a1a" },
          secondary: { main: "#2D3748" },
          background: { default: "#F5F7FA", paper: "#FFFFFF" },
          text: { primary: "#1a1a1a", secondary: "#718096" },
          success: { main: "#48BB78", light: "#F0FFF4" },
          warning: { main: "#ECC94B", light: "#FFFFF0" },
          info: { main: "#4299E1", light: "#EBF8FF" },
          divider: "#E2E8F0",
        }
      : {
          primary: { main: "#F4C430", contrastText: "#000" },
          secondary: { main: "#A0AEC0" },
          background: { default: "#050505", paper: "#0D0F14" },
          text: { primary: "#FFFFFF", secondary: "#94A3B8" },
          success: { main: "#48BB78", light: "rgba(72,187,120,0.1)" },
          warning: { main: "#ECC94B", light: "rgba(236,201,75,0.1)" },
          info: { main: "#4299E1", light: "rgba(66,153,225,0.1)" },
          divider: "#1E293B",
        }),
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { fontWeight: 900, fontSize: "4rem", letterSpacing: "-0.02em" },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: "none" as const,
      fontWeight: 700,
      fontSize: "0.95rem",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "none",
          padding: "12px 24px",
          transition: "all 0.2s ease-in-out",
          "&:hover": { boxShadow: "0 4px 12px rgba(244, 196, 48, 0.25)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          backgroundImage: "none",
          backgroundColor: theme.palette.background.paper,
          borderRadius: "20px",
          border:
            mode === "light"
              ? "1px solid #E2E8F0"
              : `1px solid ${theme.palette.divider}`,
          boxShadow:
            mode === "light"
              ? "0 4px 12px rgba(0, 0, 0, 0.03)"
              : "0 4px 20px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: any) => ({
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
  },
});
