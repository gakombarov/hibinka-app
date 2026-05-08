import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripsApi } from '../api/trips';
import { Trip } from '../shared/types/api';

export const fetchTrips = createAsyncThunk('trips/fetchAll', async () => {
  return await tripsApi.getAll();
});

export const assignVehicleToTrip = createAsyncThunk(
  'trips/assignVehicle',
  async ({ tripId, vehicleId, split }: { tripId: string, vehicleId: string, split: boolean }) => {
    return await tripsApi.assignVehicle(tripId, vehicleId, split);
  }
);

const tripsSlice = createSlice({
  name: 'trips',
  initialState: {
    items: [] as Trip[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTrips.rejected, (state) => {
        state.loading = false;
      })
      .addCase(assignVehicleToTrip.pending, (state) => {
        state.loading = true;
      })
      .addCase(assignVehicleToTrip.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(assignVehicleToTrip.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default tripsSlice.reducer;