import React from "react";
import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

interface HibinkaButtonProps extends MuiButtonProps {
  isLoading?: boolean;
  rounded?: boolean;
}

export const Button: React.FC<HibinkaButtonProps> = ({
  children,
  variant = "contained",
  color = "primary",
  isLoading = false,
  rounded = false,
  disabled,
  sx,
  ...props
}) => {
  return (
    <ThemeProvider theme={theme}>
      <MuiButton
        variant={variant}
        color={color}
        disabled={disabled || isLoading}
        sx={{
          borderRadius: rounded ? "50px" : "8px",
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

        {/* Скрываем текст, если идет загрузка, чтобы сохранить размер кнопки */}
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
    </ThemeProvider>
  );
};
