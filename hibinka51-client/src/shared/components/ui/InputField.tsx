import React, { forwardRef } from "react";
import styled from "@emotion/styled";
import { TextField, alpha, type TextFieldProps } from "@mui/material";

export const StyledTextField = styled(TextField)(({ theme }: any) => {
  const isDark = theme.palette.mode === "dark";
  return {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDark ? "#08090C" : "#F9FAFB",
      borderRadius: "12px",
      transition: "all 0.2s ease-in-out",
      "& fieldset": {
        borderColor: theme.palette.divider,
        borderWidth: "1px",
        transition: "all 0.2s ease-in-out",
      },
      "&:hover fieldset": {
        borderColor: isDark ? theme.palette.primary.main : "#D1D5DB",
      },
      "&.Mui-focused": {
        backgroundColor: theme.palette.background.paper,
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
      color: theme.palette.text.secondary,
      fontWeight: 500,
      "&.Mui-focused": { color: theme.palette.text.primary, fontWeight: 600 },
      "&.Mui-error": { color: theme.palette.error.main },
    },
    "& .MuiInputBase-input": {
      padding: "14px 16px",
      fontSize: "1rem",
      color: theme.palette.text.primary,
      fontWeight: 500,
    },
  };
});


export const InputField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => (
  <StyledTextField 
    variant="outlined" 
    fullWidth 
    {...props} 
    inputRef={ref} 
  />
));

// Полезно для отладки в DevTools
InputField.displayName = "InputField";