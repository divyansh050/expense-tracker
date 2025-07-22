import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../src/api/axios";

export interface Expense {
  _id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  status: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface SortConfig {
  key: keyof Expense | "";
  direction: "asc" | "desc";
}

interface ExpensesState {
  items: Expense[];
  loading: boolean;
  error: string;
  actionMessage: string;
  editingExpense: Expense | null;
  categoryFilter: string;
  searchTerm: string;
  sortConfig: SortConfig;
}

// Initial State
const initialState: ExpensesState = {
  items: [],
  loading: false,
  error: "",
  actionMessage: "",
  editingExpense: null,
  categoryFilter: "",
  searchTerm: "",
  sortConfig: {
    key: "",
    direction: "asc",
  },
};

// Async Thunks
export const fetchExpenses = createAsyncThunk<
  Expense[],
  void,
  { rejectValue: string }
>("expenses/fetchExpenses", async (_, thunkAPI) => {
  try {
    const res = await api.get("/expenses");
    return res.data.data;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to fetch expenses."
    );
  }
});

export const addExpense = createAsyncThunk<
  Expense,
  Partial<Expense>,
  { rejectValue: string }
>("expenses/addExpense", async (data, thunkAPI) => {
  try {
    const res = await api.post("/expenses", data);
    return res.data.data[0];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to add expense."
    );
  }
});

export const updateExpense = createAsyncThunk<
  Expense,
  { id: string; data: Partial<Expense> },
  { rejectValue: string }
>("expenses/updateExpense", async ({ id, data }, thunkAPI) => {
  try {
    const res = await api.put(`/expenses/${id}`, data);
    return res.data.data[0];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to update expense."
    );
  }
});

export const deleteExpense = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("expenses/deleteExpense", async (id, thunkAPI) => {
  try {
    await api.delete(`/expenses/${id}`);
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to delete expense."
    );
  }
});

// Slice
const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    startEditing: (state, action: PayloadAction<Expense>) => {
      state.editingExpense = action.payload;
    },
    stopEditing: (state) => {
      state.editingExpense = null;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSortConfig: (state, action: PayloadAction<SortConfig>) => {
      state.sortConfig = action.payload;
    },
    clearActionMessage: (state) => {
      state.actionMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder

      // Fetch
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error";
      })

      // Add
      .addCase(addExpense.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.actionMessage = "Expense added!";
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })

      // Update
      .addCase(updateExpense.fulfilled, (state, action) => {
        const updated = action.payload;
        state.items = state.items.map((exp) =>
          exp._id === updated._id ? updated : exp
        );
        state.editingExpense = null;
        state.actionMessage = "Expense updated!";
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.error = action.payload || "Error";
      })

      // Delete
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter((exp) => exp._id !== action.payload);
        state.actionMessage = "Expense deleted!";
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.error = action.payload || "Error";
      });
  },
});

// Exports
export const {
  startEditing,
  stopEditing,
  setCategoryFilter,
  setSearchTerm,
  setSortConfig,
  clearActionMessage,
} = expensesSlice.actions;

export default expensesSlice.reducer;
