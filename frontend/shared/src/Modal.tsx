import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export const Modal = ({ open, onClose, title, children }: any) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: { xs: 1, md: 2 },
          bgcolor: "background.paper",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 20px 40px rgba(0,0,0,0.5)"
              : "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: "1.5rem",
          color: "text.primary",
          pb: 1,
          pr: 6,
        }}
      >
        {title}
      </DialogTitle>
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          color: "text.secondary",
          "&:hover": {
            color: "text.primary",
            bgcolor: alpha(theme.palette.text.primary, 0.05),
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
