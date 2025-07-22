import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../src/api/axios";
import { RootState } from "../store";
import { Expense } from "./expensesSlice";
import { User } from "./authSlice";

interface AnalyticsItem {
  total: number;
  category: string;
  _id: keyof User;
  name: keyof User;
  username: keyof User;
}

interface AdminExpensesState {
  user: any;
  expenses: Expense[];
  loading: boolean;
  error: string;
  actionMessage: string;
  categoryTotals: AnalyticsItem[];
  userAnalytics: AnalyticsItem[];
}

// Thunk to fetch all expenses
export const fetchAllExpenses = createAsyncThunk<
  Expense[],
  void,
  { rejectValue: string }
>("admin/fetchAllExpenses", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/all");
    return Array.isArray(res.data.data) ? res.data.data : [];
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to fetch expenses."
    );
  }
});

// Thunk to update expense status
export const updateExpenseStatus = createAsyncThunk<
  Expense,
  { id: string; status: string },
  { rejectValue: string }
>("admin/updateExpenseStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/expenses/${id}`, { status });
    return res.data.data[0]; // Updated expense
  } catch (err: any) {
    return rejectWithValue(
      err?.response?.data?.message || "Failed to update status."
    );
  }
});

export const fetchCategoryTotals = createAsyncThunk<
  AnalyticsItem[],
  void,
  { rejectValue: string }
>("admin/fetchCategoryTotals", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/admin/analytics/category-totals");
    return res.data.data || [];
  } catch (err: any) {
    return rejectWithValue("Failed to fetch category totals.");
  }
});

export const fetchUserAnalytics = createAsyncThunk<
  AnalyticsItem[],
  void,
  { rejectValue: string }
>("admin/fetchUserAnalytics", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/admin/analytics/users");
    return res.data.data || [];
  } catch (err: any) {
    return rejectWithValue("Failed to fetch user analytics.");
  }
});

const initialState: AdminExpensesState = {
  user: null,
  expenses: [],
  loading: false,
  error: "",
  actionMessage: "",
  categoryTotals: [],
  userAnalytics: [],
};

const adminExpensesSlice = createSlice({
  name: "adminExpenses",
  initialState,
  reducers: {
    setAdminUser(state, action: PayloadAction<any>) {
      state.user = action.payload;
    },
    clearAdminState(state) {
      state.expenses = [];
      state.error = "";
      state.actionMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllExpenses.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(
        fetchAllExpenses.fulfilled,
        (state, action: PayloadAction<Expense[]>) => {
          state.expenses = action.payload;
          state.loading = false;
        }
      )
      .addCase(fetchAllExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "";
      })
      .addCase(
        updateExpenseStatus.fulfilled,
        (state, action: PayloadAction<Expense>) => {
          const updated = action.payload;
          state.expenses = state.expenses.map((exp) =>
            exp._id === updated._id ? { ...exp, status: updated.status } : exp
          );
          state.actionMessage = `Expense status changed to "${updated.status}"`;
        }
      )
      .addCase(updateExpenseStatus.rejected, (state, action) => {
        state.error = action.payload || "";
      })
      .addCase(
        fetchCategoryTotals.fulfilled,
        (state, action: PayloadAction<AnalyticsItem[]>) => {
          state.categoryTotals = action.payload;
        }
      )
      .addCase(fetchCategoryTotals.rejected, (state, action) => {
        state.error = action.payload || "";
      })
      .addCase(
        fetchUserAnalytics.fulfilled,
        (state, action: PayloadAction<AnalyticsItem[]>) => {
          state.userAnalytics = action.payload;
        }
      )
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.error = action.payload || "";
      });
  },
});

export const { setAdminUser, clearAdminState } = adminExpensesSlice.actions;

export const selectAdminExpenses = (state: RootState) => state.adminExpenses;

export default adminExpensesSlice.reducer;
