import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {scheduledTripsApi} from "../api/scheduledTrips";
import {ScheduledTripResponse} from "../shared/types/api";

interface ScheduledTripsState {
    items: ScheduledTripResponse[];
    loading: boolean;
    isGenerating: boolean;
    error: string | null;
}

const initialState: ScheduledTripsState = {
    items: [],
    loading: false,
    isGenerating: false,
    error: null,
};

export const fetchAdminSchedules = createAsyncThunk(
    "scheduledTrips/fetchAll",
    async () => await scheduledTripsApi.getAllAdmin()
);

export const triggerGeneration = createAsyncThunk(
    "scheduledTrips/triggerSync",
    async () => {
        await scheduledTripsApi.triggerSync();
        return new Promise(resolve => setTimeout(resolve, 2000));
    }
);

const scheduledTripsSlice = createSlice({
    name: "scheduledTrips",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminSchedules.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAdminSchedules.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(triggerGeneration.pending, (state) => {
                state.isGenerating = true;
            })
            .addCase(triggerGeneration.fulfilled, (state) => {
                state.isGenerating = false;
            });
    },
});

export default scheduledTripsSlice.reducer;