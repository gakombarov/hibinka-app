import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllVehicles } from "../api/vehicles";
import { Vehicle } from "../shared/types/api";

export type SortKey = 'alias' | 'brand' | 'model' | 'license_plate' | 'capacity' | 'category' | 'is_active';
export type SortDir = 'asc' | 'desc';

interface VehiclesState {
  list: Vehicle[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  skip: number;
  limit: number;
  sortKey: SortKey;
  sortDir: SortDir;
  filterCategory: string;
  filterCapacity: string;
  filterActive: string;
}

const initialState: VehiclesState = {
  list: [],
  loading: false,
  hasMore: true,
  error: null,
  skip: 0,
  limit: 10,
  sortKey: 'alias',
  sortDir: 'asc',
  filterCategory: '',
  filterCapacity: '',
  filterActive: '',
};

export const getAllVehiclesList = createAsyncThunk(
  "vehicles/fetchList",
  async (params: { skip: number; limit: number; sortKey: SortKey; sortDir: SortDir; filterCategory: string; filterCapacity: string; filterActive: string }) => {
    return await getAllVehicles(params);
  },
);

const vehiclesSlice = createSlice({
  name: "vehicles",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ sortKey?: SortKey; sortDir?: SortDir; filterCategory?: string; filterCapacity?: string; filterActive?: string }>) => {
      Object.assign(state, action.payload);
      state.skip = 0;
      state.list = [];
      state.hasMore = true;
    },
    incrementSkip: (state) => {
      state.skip += state.limit;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllVehiclesList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllVehiclesList.fulfilled, (state, action: PayloadAction<Vehicle[]>) => {
        state.loading = false;
        state.list = state.skip === 0 ? action.payload : state.list.concat(action.payload);
        state.hasMore = action.payload.length === state.limit;
      })
      .addCase(getAllVehiclesList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка загрузки транспортных средств";
      });
  },
});

export const { setFilters, incrementSkip } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
