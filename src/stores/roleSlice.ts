import {createBaseCrudSlice} from "./baseCrudSlice.ts";
import {RolesService} from "../api/services/RolesService.ts";

const { reducer, actions } = createBaseCrudSlice<any>({
    name: "role",
    fetchPage: async (input) => {
        const res = await RolesService.getPage({body: input});
        // API returns object with data array and count
        return {
            items: res && Array.isArray(res.items) ? res?.items : [],
            total: res?.total || 0,
        };
    },
    createItem: async (data: any) => {
        return await RolesService.create({body: data});
    },
    updateItem: async (id, data) => {
        return await RolesService.update({id: id, body: data});
    },
    deleteItem: async (id) => {
        return await RolesService.remove({id: id});
    },
});

export const roleReducer = reducer;
export const roleActions = actions;