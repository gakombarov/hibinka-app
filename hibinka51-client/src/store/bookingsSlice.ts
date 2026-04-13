import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getBooking,
  fetchAdminBookings,
  confirmBookingToTrip,
  updateBooking,
} from "../api/bookings";
import { Booking, BookingConfirm } from "../shared/types/api";

interface BookingsState {
  list: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  list: [],
  currentBooking: null,
  loading: false,
  error: null,
};

export const fetchBookingsList = createAsyncThunk(
  "bookings/fetchList",
  async ({ skip = 0, limit = 100 }: { skip?: number; limit?: number }) => {
    return await fetchAdminBookings(skip, limit);
  },
);

export const fetchBookingDetails = createAsyncThunk(
  "bookings/fetchDetails",
  async (id: string) => {
    return await getBooking(id);
  },
);

export const confirmBookingThunk = createAsyncThunk(
  "bookings/confirm",
  async ({ id, data }: { id: string; data: BookingConfirm }) => {
    return await confirmBookingToTrip(id, data);
  },
);

export const updateBookingThunk = createAsyncThunk(
  "bookings/update",
  async ({ id, data }: { id: string; data: Partial<Booking> }) => {
    return await updateBooking(id, data);
  },
);

export const cancelBookingThunk = createAsyncThunk(
  "bookings/cancel",
  async (id: string) => {
    return await updateBooking(id, { status: "CANCELLED" });
  },
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Загрузка списка
      .addCase(fetchBookingsList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBookingsList.fulfilled,
        (state, action: PayloadAction<Booking[]>) => {
          state.loading = false;
          state.list = action.payload;
        },
      )
      .addCase(fetchBookingsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки заявок";
      })

      // 2. Детали одной заявки
      .addCase(fetchBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchBookingDetails.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.loading = false;
          state.currentBooking = action.payload;
        },
      )

      // 3. Формирование в рейс
      .addCase(
        confirmBookingThunk.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.currentBooking = action.payload;
          const index = state.list.findIndex((b) => b.id === action.payload.id);
          if (index !== -1) state.list[index] = action.payload;
        },
      )

      // 4. Обновление (Сохранить изменения)
      .addCase(updateBookingThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateBookingThunk.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          state.loading = false;
          state.currentBooking = action.payload;
          const index = state.list.findIndex((b) => b.id === action.payload.id);
          if (index !== -1) state.list[index] = action.payload;
        },
      )

      // 5. Отмена
      .addCase(
        cancelBookingThunk.fulfilled,
        (state, action: PayloadAction<Booking>) => {
          const index = state.list.findIndex((b) => b.id === action.payload.id);
          if (index !== -1) state.list[index] = action.payload;

          if (state.currentBooking?.id === action.payload.id) {
            state.currentBooking = action.payload;
          }
        },
      );
  },
});

export const { clearCurrentBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
