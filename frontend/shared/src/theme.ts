import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#F4C430",
      contrastText: "#1a1a1a",
    },
    secondary: {
      main: "#333333",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
    },
    success: {
      main: "#22c55e",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
  },
});
