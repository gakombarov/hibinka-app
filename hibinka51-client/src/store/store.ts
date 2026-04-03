import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const loadState = () => {
  try {
    const serializedUser = localStorage.getItem("auth_user");
    if (serializedUser === null) return undefined;

    return {
      auth: {
        token: localStorage.getItem("token"),
        refreshToken: localStorage.getItem("refresh_token"),
        user: JSON.parse(serializedUser),
      },
    };
  } catch (err) {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
  try {
    const state = store.getState();
    if (state.auth.user) {
      localStorage.setItem("auth_user", JSON.stringify(state.auth.user));
    } else {
      localStorage.removeItem("auth_user");
    }
  } catch (e) {
    console.error(e);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
