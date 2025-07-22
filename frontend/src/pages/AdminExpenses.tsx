import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/axios";

interface Expense {
  _id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: string;
}

export default function AdminExpenses() {
  const { user, token } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  const [filterCategory, setFilterCategory] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const fetchAllExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/expenses/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await api.put(
          `/expenses/${id}`,
          { status },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === id ? { ...exp, status: res.data.data[0].status } : exp
          )
        );
        setActionMessage(`Expense status changed to "${status}"`);
        setTimeout(() => setActionMessage(""), 2000);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to update status.");
      }
    },
    [token]
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/expenses");
      return;
    }
    fetchAllExpenses();
  }, [user, navigate, fetchAllExpenses]);

  const filteredExpenses = expenses.filter((exp: any) => {
    const matchesCategory = filterCategory
      ? exp.category?.toLowerCase() === filterCategory.toLowerCase()
      : true;

    const matchesUser = filterUser ? exp.user?.name === filterUser : true;

    const matchesDate = filterDate
      ? new Date(exp.date).toISOString().split("T")[0] === filterDate
      : true;

    return matchesCategory && matchesUser && matchesDate;
  });

  const uniqueUsers = [
    ...new Set(expenses.map((exp: any) => exp.user?.name).filter(Boolean)),
  ];

  const uniqueCategories = [
    ...new Set(
      expenses.map((exp: any) => exp.category?.toLowerCase()).filter(Boolean)
    ),
  ];

  const isAnyFilterApplied =
    filterCategory !== "" || filterUser !== "" || filterDate !== "";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading all expenses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto sm:p-4 px-2 pt-4 max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-5xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
          Expense Management
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
          Review and manage all expense submissions across the organization.
        </p>

        {/* 🔍 Filters */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
              Filter by User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="border p-2 rounded w-full h-10"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border p-2 rounded w-full h-10"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option className="capitalize" key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border p-2 rounded w-full h-10"
            />
          </div>

          <button
            onClick={() => {
              setFilterCategory("");
              setFilterUser("");
              setFilterDate("");
            }}
            disabled={!isAnyFilterApplied}
            className={`${
              isAnyFilterApplied
                ? "bg-gray-200 hover:bg-gray-300 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } text-gray-800 font-medium px-4 py-2 rounded whitespace-nowrap h-10`}
          >
            Reset Filters
          </button>
        </div>

        <div className="h-6 mb-4">
          {actionMessage && (
            <div className="h-full bg-green-100 text-green-700 p-2 rounded text-center font-medium text-sm sm:text-base flex items-center justify-center transition-all duration-300">
              {actionMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-center text-sm sm:text-base">
              {error}
            </div>
          )}
        </div>

        {/* 📋 Expenses Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-[600px] sm:min-w-full border-collapse bg-white rounded shadow text-xs sm:text-sm md:text-base capitalize">
            <thead>
              <tr className="bg-blue-100 text-blue-700">
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  User
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Email
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Description
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Category
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-left">
                  Date
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-right">
                  Amount
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                  Status
                </th>
                <th className="py-2 px-2 sm:px-4 font-semibold text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-gray-400">
                    No expenses found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense: any) => (
                  <tr key={expense._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 sm:px-4 break-words max-w-[100px]">
                      {expense.user?.name || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4 break-all max-w-[120px]">
                      {expense.user?.email || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4">
                      {expense.description || "-"}
                    </td>
                    <td className="py-2 px-2 sm:px-4">{expense.category}</td>
                    <td className="py-2 px-2 sm:px-4">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right text-red-600 font-bold">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <span
                        className={
                          expense.status?.toLowerCase() === "approved"
                            ? "text-green-600 font-medium"
                            : expense.status?.toLowerCase() === "rejected"
                            ? "text-red-600 font-medium"
                            : "text-gray-700 font-medium"
                        }
                      >
                        {expense.status?.charAt(0).toUpperCase() +
                          expense.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-center">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 justify-center">
                        {expense.status !== "approved" && (
                          <button
                            onClick={() =>
                              handleStatusChange(expense._id, "approved")
                            }
                            className="text-white bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-xs sm:text-sm cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {expense.status !== "rejected" && (
                          <button
                            onClick={() =>
                              handleStatusChange(expense._id, "rejected")
                            }
                            className="text-white bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-xs sm:text-sm cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
