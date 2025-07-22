import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  startEditing,
  stopEditing,
  setCategoryFilter,
  setSearchTerm,
  setSortConfig,
  clearActionMessage,
} from "../../redux/slices/expensesSlice";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import { AppDispatch, RootState } from "../../redux/store";
import { Expense as ExpenseInterface } from "../../redux/slices/expensesSlice";

type NewExpense = Omit<ExpenseInterface, "_id" | "status">;

export default function Expenses() {
  const dispatch = useDispatch<AppDispatch>();

  const {
    items,
    loading,
    error,
    actionMessage,
    editingExpense,
    categoryFilter,
    searchTerm,
    sortConfig,
  } = useSelector((state: RootState) => state.expenses);

  const expenses = items as ExpenseInterface[];

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        dispatch(clearActionMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage, dispatch]);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch, fetchExpenses]);

  const handleAddExpense = useCallback(
    (data: NewExpense) => {
      dispatch(addExpense(data));
    },
    [dispatch, addExpense]
  );

  const handleEditExpense = useCallback(
    (data: Partial<ExpenseInterface>) => {
      if (!editingExpense) return;
      dispatch(updateExpense({ id: editingExpense._id, data }));
    },
    [dispatch, editingExpense]
  );

  const handleDeleteExpense = useCallback(
    (id: string) => {
      if (editingExpense && editingExpense._id === id) {
        dispatch(stopEditing());
      }
      dispatch(deleteExpense(id));
    },
    [dispatch, deleteExpense, editingExpense, stopEditing]
  );

  const handleStartEditExpense = useCallback(
    (expense: ExpenseInterface) => {
      dispatch(startEditing(expense));
    },
    [dispatch, startEditing]
  );

  const handleCancelEdit = useCallback(() => {
    dispatch(stopEditing());
  }, [dispatch]);

  const handleSetCategoryFilter = useCallback(
    (val: string) => {
      dispatch(setCategoryFilter(val));
    },
    [dispatch, setCategoryFilter]
  );

  const handleSetSearchTerm = useCallback(
    (val: string) => {
      dispatch(setSearchTerm(val));
    },
    [dispatch, setSearchTerm]
  );

  const handleSetSortConfig = useCallback(
    (val: { key: keyof ExpenseInterface | ""; direction: "asc" | "desc" }) => {
      dispatch(setSortConfig(val));
    },
    [dispatch, setSortConfig]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto sm:p-4 px-2 pt-4 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">
          Track and Manage Your Expenses
        </h1>

        <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
          Easily add, view, and manage your personal expenses. Stay organized
          and on top of your spending anytime.
        </p>

        <div className="w-full">
          <ExpenseForm
            onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
            initialData={editingExpense || undefined}
            onCancel={editingExpense ? handleCancelEdit : undefined}
          />
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="h-8 mb-4">
          {actionMessage && (
            <div className="h-full bg-green-100 text-green-700 p-2 rounded text-center font-medium text-sm sm:text-base flex items-center justify-center transition-all duration-300">
              {actionMessage}
            </div>
          )}
        </div>

        <div className="w-full overflow-x-auto">
          <ExpenseTable
            expenses={expenses}
            onDelete={handleDeleteExpense}
            onEdit={handleStartEditExpense}
            categoryFilter={categoryFilter}
            setCategoryFilter={handleSetCategoryFilter}
            searchTerm={searchTerm}
            setSearchTerm={handleSetSearchTerm}
            sortConfig={sortConfig}
            setSortConfig={handleSetSortConfig}
          />
        </div>
      </div>
    </div>
  );
}
