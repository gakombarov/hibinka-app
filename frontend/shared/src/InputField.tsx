import styled from "@emotion/styled";
import { TextField } from "@mui/material";
import { theme } from "./theme";
import { alpha } from "@mui/material";

export const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    transition: "all 0.2s ease-in-out",
    "& fieldset": {
      borderColor: "#E5E7EB",
      borderWidth: "1px",
      transition: "all 0.2s ease-in-out",
    },
    "&:hover fieldset": { borderColor: "#D1D5DB" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
    "&.Mui-error fieldset": { borderColor: theme.palette.error.main },
    "&.Mui-error.Mui-focused": {
      boxShadow: `0 0 0 4px ${alpha(theme.palette.error.main, 0.15)}`,
    },
  },
  "& .MuiInputLabel-root": {
    color: "#6B7280",
    fontWeight: 500,
    "&.Mui-focused": { color: "#1a1a1a", fontWeight: 600 },
    "&.Mui-error": { color: theme.palette.error.main },
  },
  "& .MuiInputBase-input": {
    padding: "14px 16px",
    fontSize: "1rem",
    color: "#1a1a1a",
    fontWeight: 500,
  },
}));

export const InputField = (props: any) => (
  <StyledTextField variant="outlined" fullWidth {...props} />
);
