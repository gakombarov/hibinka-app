import React from "react";
import { Button as MuiButton, CircularProgress } from "@mui/material";

export const Button = ({
  children,
  variant = "contained",
  color = "primary",
  isLoading = false,
  rounded = false,
  disabled,
  sx,
  ...props
}: any) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      disabled={disabled || isLoading}
      sx={{
        borderRadius: rounded ? "50px" : "12px",
        height:
          props.size === "large"
            ? "48px"
            : props.size === "small"
              ? "32px"
              : "40px",
        ...sx,
      }}
      {...props}
    >
      {isLoading ? (
        <CircularProgress
          size={24}
          color="inherit"
          sx={{ position: "absolute" }}
        />
      ) : null}
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
