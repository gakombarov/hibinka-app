import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vehiclesApi } from '../api/vehicles';
import { Vehicle } from '../shared/types/api';

export const fetchVehicles = createAsyncThunk('vehicles/fetchAll', async () => {
  return await vehiclesApi.getAll();
});

export const createVehicle = createAsyncThunk(
  'vehicles/create',
  async (data: Partial<Vehicle>, { rejectWithValue }) => {
    try {
      return await vehiclesApi.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Error');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/update',
  async ({ id, data }: { id: string; data: Partial<Vehicle> }, { rejectWithValue }) => {
    try {
      return await vehiclesApi.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Error');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await vehiclesApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Error');
    }
  }
);

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState: {
    items: [] as Vehicle[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed';
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => { state.loading = true; }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state) => { state.loading = false; }
      );
  },
});

export default vehiclesSlice.reducer;