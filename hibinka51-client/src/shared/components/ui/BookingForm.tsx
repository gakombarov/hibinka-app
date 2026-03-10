import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Grid, InputAdornment } from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOn from "@mui/icons-material/LocationOn";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LuggageOutlinedIcon from "@mui/icons-material/LuggageOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import "dayjs/locale/ru";

import { InputField } from "./InputField";
import { Button } from "./Button";

export interface BookingFormData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  departure_location: string;
  arrival_location: string;
  booking_date: string;
  booking_time?: string;
  passenger_count: number;
  luggage?: string;
  comments?: string;
}

interface BookingFormProps {
  isModal?: boolean;
  onSubmit?: (data: BookingFormData) => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  isModal = false,
  onSubmit,
  isLoading = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      departure_location: "",
      arrival_location: "",
      booking_date: dayjs().add(1, "day").format("YYYY-MM-DD"),
      booking_time: "12:00",
      passenger_count: 1,
      luggage: "",
      comments: "",
    },
  });

  const onFormSubmit = (data: BookingFormData) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container spacing={2.5}>
          {/* ИМЯ */}
          <Grid size={{ xs: 12, md: isModal ? 12 : 6 }}>
            <Controller
              name="customer_name"
              control={control}
              rules={{ required: "Обязательное поле" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Ваше имя *"
                  placeholder="Александр"
                  error={!!errors.customer_name}
                  helperText={errors.customer_name?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* ТЕЛЕФОН */}
          <Grid size={{ xs: 12, md: isModal ? 12 : 6 }}>
            <Controller
              name="customer_phone"
              control={control}
              rules={{ required: "Обязательное поле" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Телефон *"
                  placeholder="+7 (___) ___-__-__"
                  error={!!errors.customer_phone}
                  helperText={errors.customer_phone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* EMAIL */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="customer_email"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Email"
                  placeholder="example@mail.ru"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* ОТКУДА */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="departure_location"
              control={control}
              rules={{ required: "Обязательное поле" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Откуда *"
                  placeholder="Мурманск"
                  error={!!errors.departure_location}
                  helperText={errors.departure_location?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* КУДА */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="arrival_location"
              control={control}
              rules={{ required: "Обязательное поле" }}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Куда *"
                  placeholder="Кировск"
                  error={!!errors.arrival_location}
                  helperText={errors.arrival_location?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* ДАТА (С ПРАВИЛЬНЫМ КАЛЕНДАРЕМ) */}
          <Grid size={{ xs: 6, md: 4 }}>
            <Controller
              name="booking_date"
              control={control}
              rules={{ required: "Укажите дату" }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  label="Дата *"
                  format="DD.MM.YYYY"
                  disablePast
                  value={dayjs(field.value)}
                  onChange={(newValue) => {
                    if (newValue) {
                      field.onChange(newValue.format("YYYY-MM-DD"));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventOutlinedIcon
                              fontSize="small"
                              color="action"
                            />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* ВРЕМЯ */}
          <Grid size={{ xs: 6, md: 4 }}>
            <Controller
              name="booking_time"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TimePicker
                  label="Время"
                  ampm={false}
                  format="HH:mm"
                  value={
                    field.value ? dayjs(`2000-01-01T${field.value}`) : null
                  }
                  onChange={(newValue) => {
                    if (newValue) {
                      field.onChange(newValue.format("HH:mm"));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!error,
                      helperText: error?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeOutlinedIcon
                              fontSize="small"
                              color="action"
                            />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              )}
            />
          </Grid>

          {/* ПАССАЖИРЫ */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="passenger_count"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Пассажиров"
                  type="number"
                  inputProps={{ min: 1, max: 20 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* БАГАЖ */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="luggage"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Багаж"
                  placeholder="Чемоданы, сумки, лыжи, сноуборд..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LuggageOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* КОММЕНТАРИЙ */}
          <Grid size={{ xs: 12 }}>
            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <InputField
                  {...field}
                  fullWidth
                  label="Комментарий"
                  placeholder="Детское кресло, особые пожелания..."
                  multiline
                  rows={2}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1.5 }}
                      >
                        <ChatBubbleOutlineIcon
                          fontSize="small"
                          color="action"
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* КНОПКА ОТПРАВКИ */}
          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              isLoading={isLoading}
              sx={{ py: 1.5, fontSize: "1.1rem" }}
            >
              Оформить заявку
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};
