// src/store/userSlice.ts
import { createBaseCrudSlice } from "./baseCrudSlice";
import {UsersService} from "../api/services/UsersService.ts";

export interface UserProfile {
    userId: string | undefined;
    email: string | undefined;
    roleId: string | undefined;
    role: string | undefined;
}

const { reducer, actions } = createBaseCrudSlice<any>({
    name: "user",
    fetchPage: async (input) => {
        const res = await UsersService.getPage({body: input});
        // API returns object with data array and count
        return {
            items: res && Array.isArray(res.items) ? res?.items : [],
            total: res?.total || 0,
        };
    },
    createItem: async (data: any) => {
        return await UsersService.create({body: data});
    },
    updateItem: async (id, data) => {
        return await UsersService.update({id: id, body: data});
    },
    deleteItem: async (id) => {
        return await UsersService.remove({id: id});
    },
});

export const userReducer = reducer;
export const userActions = actions;
