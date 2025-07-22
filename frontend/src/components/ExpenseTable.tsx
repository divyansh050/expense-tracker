import { useCallback, useMemo, useState } from "react";
import {
  Expense as ExpenseInterface,
  SortConfig,
} from "../../redux/slices/expensesSlice";

type Props = {
  expenses: ExpenseInterface[];
  onDelete: (id: string) => void;
  onEdit?: (expense: ExpenseInterface) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  sortConfig: SortConfig;
  setSortConfig: (val: SortConfig) => void;
};

export default function ExpenseTable({
  expenses,
  onDelete,
  onEdit,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  sortConfig,
  setSortConfig,
}: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const categories = useMemo(
    () =>
      Array.from(
        new Set(expenses.map((exp) => exp.category?.toLowerCase().trim()))
      )
        .filter(Boolean)
        .sort(),
    [expenses]
  );

  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (categoryFilter) {
      result = result.filter(
        (exp) =>
          exp.category?.toLowerCase().trim() ===
          categoryFilter.toLowerCase().trim()
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.description?.toLowerCase().includes(search) ||
          exp.category?.toLowerCase().includes(search)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      result = result.filter((exp) => new Date(exp.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((exp) => new Date(exp.date) <= end);
    }

    return result;
  }, [expenses, categoryFilter, searchTerm, startDate, endDate]);

  const sortedExpenses = useMemo(() => {
    const { key, direction } = sortConfig;
    if (!key) return filteredExpenses;

    return [...filteredExpenses].sort((a, b) => {
      const aVal = a[key as keyof ExpenseInterface];
      const bVal = b[key as keyof ExpenseInterface];

      // Handle undefined/null values first
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return direction === "asc" ? 1 : -1;
      if (bVal == null) return direction === "asc" ? -1 : 1;

      let aValue: number | string = aVal as string;
      let bValue: number | string = bVal as string;

      // Normalize for comparison
      if (key === "amount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (key === "date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortConfig]);

  const handleCategoryFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setCategoryFilter(e.target.value),
    [setCategoryFilter]
  );
  const handleSearchTerm = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value),
    [setSearchTerm]
  );

  const handleSort = useCallback(
    (key: string) => {
      // @ts-ignore
      setSortConfig((prev) => {
        if (prev.key === key) {
          return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        }
        return { key, direction: "asc" };
      });
    },
    [setSortConfig]
  );

  const confirmDelete = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      onDelete(expenseToDelete);
      setExpenseToDelete(null);
      setShowModal(false);
    }
  };

  const handleCancelDelete = () => {
    setExpenseToDelete(null);
    setShowModal(false);
  };

  const handleStartDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = e.target.value;
      if (endDate && new Date(newStart) > new Date(endDate)) {
        setEndDate(newStart);
      }
      setStartDate(newStart);
    },
    [endDate]
  );

  const handleEndDate = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEnd = e.target.value;
      if (startDate && new Date(newEnd) < new Date(startDate)) {
        setStartDate(newEnd);
      }
      setEndDate(newEnd);
    },
    [startDate]
  );

  const isFiltered = categoryFilter || searchTerm || startDate || endDate;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap sm:items-center gap-2 sm:gap-4 mb-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Category:</span>
          <select
            value={categoryFilter || ""}
            onChange={handleCategoryFilter}
            className="border p-1 rounded w-full sm:w-auto"
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Search:</span>
          <input
            type="text"
            placeholder="Description/Category"
            value={searchTerm || ""}
            onChange={handleSearchTerm}
            className="border p-1 rounded w-full sm:w-auto"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">Start:</span>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDate}
            className="border p-1 rounded w-full sm:w-auto"
            max={endDate || today}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base">End:</span>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDate}
            className="border p-1 rounded w-full sm:w-auto"
            max={today}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[650px] sm:min-w-full border-collapse bg-white rounded shadow text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-blue-100 text-blue-700">
              {["description", "category", "date", "amount"].map((key) => (
                <th
                  key={key}
                  className={`py-2 px-2 sm:px-4 font-semibold ${
                    key === "amount" ? "text-right" : "text-left"
                  }`}
                >
                  <button
                    className={`w-full ${
                      key === "amount" ? "text-right" : "text-left"
                    }`}
                    onClick={() => handleSort(key as keyof ExpenseInterface)}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                </th>
              ))}
              <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                Status
              </th>
              <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-3 text-gray-400">
                  {expenses.length === 0
                    ? "You haven’t added any expenses yet."
                    : isFiltered
                    ? "No expenses match the applied filters."
                    : "No expenses found."}
                </td>
              </tr>
            ) : (
              sortedExpenses.map((expense) => {
                const isPending = expense.status === "Pending";
                return (
                  <tr
                    key={expense._id}
                    className="border-b hover:bg-gray-50"
                    onMouseEnter={() => setHoveredRow(expense._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="py-2 px-2 sm:px-4 break-words max-w-[120px] capitalize">
                      {expense.description || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4 capitalize">
                      {expense.category}
                    </td>
                    <td className="py-2 px-2 sm:px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right text-red-600 font-bold">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center capitalize">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold
                          ${
                            expense.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : expense.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }
                        `}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 justify-center">
                        <button
                          className="text-blue-600 hover:underline text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() => isPending && onEdit?.(expense)}
                          disabled={!isPending}
                          title={
                            !isPending && hoveredRow === expense._id
                              ? "You can only edit if status is pending"
                              : ""
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline text-sm disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                          onClick={() =>
                            isPending && confirmDelete(expense._id)
                          }
                          disabled={!isPending}
                          title={
                            !isPending && hoveredRow === expense._id
                              ? "You can only delete if status is pending"
                              : ""
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete this expense?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
