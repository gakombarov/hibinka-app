import React, { useState } from "react";
import { Stack, Typography, InputAdornment } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { InputField } from "@shared/components/ui/InputField";
import { Button } from "@shared/components/ui/Button";

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Stack spacing={3} sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Введите логин и пароль для входа в систему
      </Typography>
      <InputField
        label="Логин (Email)"
        placeholder="admin@hibinka51.ru"
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlineIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      <InputField
        label="Пароль"
        type="password"
        placeholder="*********"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      <Button
        size="large"
        onClick={onLogin}
        sx={{
          mt: 2,
          py: 1.5,
          fontSize: "1.1rem",
          width: "100%",
          color: "#1a1a1a",
        }}
      >
        Войти в систему
      </Button>
    </Stack>
  );
};
