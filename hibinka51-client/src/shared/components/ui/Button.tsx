import React from "react";
import {
  Button as MuiButton,
  CircularProgress,
  ButtonProps as MuiButtonProps,
} from "@mui/material";

interface CustomButtonProps extends Omit<MuiButtonProps, "color"> {
  isLoading?: boolean;
  rounded?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit";
}

export const Button = ({
  children,
  variant = "contained",
  color = "primary",
  isLoading = false,
  rounded = false,
  disabled,
  sx,
  size = "medium",
  ...props
}: CustomButtonProps) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || isLoading}
      sx={{
        borderRadius: rounded ? "50px" : "12px",
        textTransform: "none",
        height: size === "large" ? "48px" : size === "small" ? "32px" : "40px",
        position: "relative",
        ...sx,
      }}
      {...props}
    >
      {isLoading && (
        <CircularProgress
          size={20}
          color="inherit"
          sx={{
            position: "absolute",
            left: "50%",
            marginLeft: "-10px",
          }}
        />
      )}
      <span
        style={{
          opacity: isLoading ? 0 : 1,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {children}
      </span>
    </MuiButton>
  );
};
