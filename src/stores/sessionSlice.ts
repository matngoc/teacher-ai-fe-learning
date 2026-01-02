import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {UserProfile} from "./userSlice.ts";


const initialState: UserProfile = {
    userId: undefined,
    email: undefined,
    roleId: undefined,
    role: undefined,
};

export const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserProfile>) => {
            state.userId = action.payload.userId;
            state.email = action.payload.email;
            state.role = action.payload.role;
            state.roleId = action.payload.roleId;
        },

        clearUser: (state) => {
            state.userId = undefined;
            state.email = undefined;
            state.role = undefined;
            state.roleId = undefined;
        }
    }
});

export const { setUser, clearUser } = sessionSlice.actions;

export default sessionSlice.reducer;
