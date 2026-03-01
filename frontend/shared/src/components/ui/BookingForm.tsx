import React from "react";
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

import { InputField } from "./InputField";
import { Button } from "./Button";

interface BookingFormProps {
  isModal?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  isModal = false,
}) => (
  <Box component="form">
    <Grid container spacing={2.5}>
      {" "}
      <Grid size={{ xs: 12, md: isModal ? 12 : 6 }}>
        {" "}
        <InputField
          fullWidth
          label="Ваше имя *"
          placeholder="Александр"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: isModal ? 12 : 6 }}>
        {" "}
        <InputField
          fullWidth
          label="Телефон *"
          placeholder="+7 (___) ___-__-__"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {" "}
        <InputField
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
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {" "}
        <InputField
          fullWidth
          label="Откуда"
          placeholder="Пункт А"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        {" "}
        <InputField
          fullWidth
          label="Куда"
          placeholder="Пункт Б"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        {" "}
        <InputField
          fullWidth
          label="Дата"
          type="date"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EventOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 4 }}>
        {" "}
        <InputField
          fullWidth
          label="Время"
          type="time"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTimeOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        {" "}
        <InputField
          fullWidth
          label="Пассажиров"
          type="number"
          defaultValue={1}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupOutlinedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {" "}
        <InputField
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
      </Grid>
      <Grid size={{ xs: 12 }}>
        {" "}
        <InputField
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
                <ChatBubbleOutlineIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {" "}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ py: 1.5, fontSize: "1.1rem" }}
        >
          Оформить заявку
        </Button>
      </Grid>
    </Grid>
  </Box>
);
