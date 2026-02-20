import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode; // Это свойство позволяет передавать внутрь любую форму!
}

export const Modal = ({ open, onClose, title, children }: ModalProps) => {
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
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: "1.5rem",
          color: "#1a1a1a",
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
          color: "#9CA3AF",
          "&:hover": { color: "#1a1a1a", bgcolor: "#F3F4F6" },
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        {/* Здесь будет рендериться то, что мы передадим внутрь */}
        {children}
      </DialogContent>
    </Dialog>
  );
};
