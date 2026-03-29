import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Modal } from "../../shared/components/ui/Modal";
import { confirmBookingToTrip } from "../../api/bookings";

interface ConfirmBookingModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string | null;
  onSuccess: () => void;
}

export const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  open,
  onClose,
  bookingId,
  onSuccess,
}) => {
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [paidAmount, setPaidAmount] = useState<number | "">(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTotalAmount("");
      setPaidAmount(0);
      setError(null);
    }
  }, [open]);

  const debt = (Number(totalAmount) || 0) - (Number(paidAmount) || 0);

  const handleSubmit = async () => {
    if (!bookingId) return;
    if (!totalAmount || Number(totalAmount) <= 0) {
      setError("Укажите корректную итоговую цену");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await confirmBookingToTrip(
        bookingId,
        Number(totalAmount),
        Number(paidAmount),
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Ошибка при формировании поездки");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Сформировать поездку">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Заявка будет перенесена в Журнал. Укажите итоговую стоимость и сумму,
          которую клиент уже выплатил.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Итого к оплате (₽)"
          type="number"
          fullWidth
          value={totalAmount}
          onChange={(e) =>
            setTotalAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
        />

        <TextField
          label="Уже выплачено (₽)"
          type="number"
          fullWidth
          value={paidAmount}
          onChange={(e) =>
            setPaidAmount(e.target.value === "" ? "" : Number(e.target.value))
          }
          helperText="Например, внесенный аванс"
        />

        <Box
          sx={{
            p: 2,
            bgcolor:
              debt > 0
                ? "error.main"
                : totalAmount
                  ? "success.main"
                  : "grey.300",
            borderRadius: 2,
            color: totalAmount ? "#fff" : "text.primary",
            transition: "background-color 0.3s",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {!totalAmount
              ? "Введите сумму"
              : debt > 0
                ? `Остаток к оплате (Долг): ${debt} ₽`
                : "Полностью оплачено"}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ mt: 1, py: 1.5 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Подтвердить и перенести"
          )}
        </Button>
      </Box>
    </Modal>
  );
};
