import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Stack, Alert, CircularProgress, Typography } from "@mui/material";

import { InputField } from "@shared/components/ui/InputField";
import { Button } from "@shared/components/ui/Button";
import { setCredentials } from "../../store/authSlice";
import { authApi } from "../../api/auth";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (data: any) => {
    setApiError(null); 
    
    try {
      const { access_token } = await authApi.login(data.email, data.password);
      const user = await authApi.getMe(access_token);
      
      dispatch(setCredentials({ user, token: access_token }));
      onLoginSuccess();
    } catch (error: any) {
      setApiError(error.message || "Непредвиденная ошибка при входе");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Введите свои данные для доступа к панели управления.
        </Typography>

        {/* 3. Блок вывода ошибки (показывается только если apiError не null) */}
        {apiError && (
          <Alert 
            severity="error" 
            variant="filled" 
            sx={{ borderRadius: "12px" }}
          >
            {apiError}
          </Alert>
        )}

        <Controller
          name="email"
          control={control}
          rules={{ required: "Укажите Email" }}
          render={({ field }) => (
            <InputField 
              {...field} 
              label="Логин (Email)" 
              placeholder="admin@hibinka51.ru"
              error={!!errors.email} 
              helperText={errors.email?.message} 
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{ required: "Введите пароль" }}
          render={({ field }) => (
            <InputField 
              {...field} 
              label="Пароль" 
              type="password" 
              placeholder="********"
              error={!!errors.password} 
              helperText={errors.password?.message} 
            />
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          sx={{ mt: 2, width: "100%", height: "48px" }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Войти в систему"
          )}
        </Button>
      </Stack>
    </form>
  );
};