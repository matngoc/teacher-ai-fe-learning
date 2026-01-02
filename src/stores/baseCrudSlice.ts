import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {CommonResultDto} from "../core/components/dto/commonResultDto.ts";
import {toast} from "react-toastify";
import type {PageRequestDto} from "../api/services/index.defs.ts";

interface FilterState {
    keyword?: string;
    [key: string]: any;
}

interface BaseState<T> {
    list: T[];
    total: number;
    loading: boolean;
    page: number;
    filters: FilterState;
    pageSize: number;
    error?: string;
}

export const createBaseCrudSlice = <T>(
    {
       name,
       fetchPage,
       createItem,
       updateItem,
       deleteItem,
    }: {
    name: string;
    fetchPage: (params: PageRequestDto) => Promise<{ data: T[]; total: number }>;
    createItem: (data: Partial<T>) => Promise<CommonResultDto<any>>;
    updateItem: (id: string, data: Partial<T>) => Promise<CommonResultDto<any>>;
    deleteItem: (id: string) => Promise<CommonResultDto<any>>;
}) => {
    const initialState: BaseState<T> = {
        list: [],
        total: 0,
        loading: false,
        page: 1,
        filters: {},
        pageSize: 10,
    };

    const getPage = createAsyncThunk(
        `${name}/getPage`,
        async (params: PageRequestDto) => {
            const res = await fetchPage(params);
            return res;
        }
    );

    const createData = createAsyncThunk(
        `${name}/create`,
        async (data: Partial<T>, { dispatch, getState }: any) => {
            const res = await createItem(data);

            if (res.isSuccessful) {
                toast.success(res.message ?? "Thêm mới thành công!");
            } else {
                toast.error(res.message ?? "Thêm mới thất bại");
            }

            refreshPage(dispatch, getState()[name]);
        }
    );

    const updateData = createAsyncThunk(
        `${name}/update`,
        async ({ id, data }: { id: string; data: Partial<T> }, { dispatch, getState }: any) => {
            const res = await updateItem(id, data);

            if (res.isSuccessful) {
                toast.success(res.message ?? "Updated successfully!");
            } else {
                toast.error(res.message ?? "Update failed!");
            }

            refreshPage(dispatch, getState()[name]);
        }
    );

    const deleteData = createAsyncThunk(
        `${name}/delete`,
        async (id: string, { dispatch, getState }: any) => {
            const res = await deleteItem(id);

            if (res.isSuccessful) {
                toast.success(res.message ?? "Deleted successfully!");
            } else {
                toast.error(res.message ?? "Delete failed!");
            }

            refreshPage(dispatch, getState()[name]);
        }
    );

    const applyFilters = createAsyncThunk(
        `${name}/applyFilters`,
        async (filters: FilterState, { dispatch, getState }: any) => {
            dispatch(slice.actions.setFilters(filters));

            const state = getState()[name];

            dispatch(
                getPage({
                    page: state.page,
                    size: state.pageSize,
                    filters: state.filters,
                })
            );
        }
    );
    const refreshPage = (dispatch: any, state: any) => {
        dispatch(
            getPage({
                page: state.page,
                size: state.pageSize,
                filters: state.filters,
            })
        );
    };

    const slice = createSlice({
        name,
        initialState,
        reducers: {
            setPage(state, action) {
                state.page = action.payload;
            },

            setFilters(state, action) {
                state.filters = {
                    ...state.filters,
                    ...action.payload,
                };
                state.page = 1;
            },

            resetFilters(state) {
                state.filters = {};
                state.page = 1;
            },
        },
        extraReducers: (builder) => {
            builder
                .addCase(getPage.pending, (state) => {
                    state.loading = true;
                })
                .addCase(getPage.fulfilled, (state, action) => {
                    state.loading = false;
                    state.list = action.payload.data as [];
                    state.total = action.payload.total;
                })
                .addCase(getPage.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.error.message;
                })
                .addCase(createData.pending, (state) => {
                    state.loading = true;
                })
                .addCase(createData.fulfilled, (state) => {
                    state.loading = false;
                })
                .addCase(updateData.pending, (state) => {
                    state.loading = true;
                })
                .addCase(updateData.fulfilled, (state) => {
                    state.loading = false;
                })
                .addCase(deleteData.pending, (state) => {
                    state.loading = true;
                })
                .addCase(deleteData.fulfilled, (state) => {
                    state.loading = false;
                });
        },
    });

    return {
        reducer: slice.reducer,
        actions: { ...slice.actions, getPage, applyFilters, createData, updateData, deleteData },
    };
};