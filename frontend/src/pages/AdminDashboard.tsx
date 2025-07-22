import { useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryTotals,
  fetchUserAnalytics,
  selectAdminExpenses,
} from "../../redux/slices/adminExpensesSlice";
import type { AppDispatch } from "../../redux/store";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#9966cc",
  "#ea5545",
  "#87ceeb",
  "#da70d6",
  "#32cd32",
  "#6495ed",
  "#ff6347",
  "#ffb6c1",
];

function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

function CategoryTotalsChart() {
  const dispatch = useDispatch<AppDispatch>();
  const { categoryTotals, error } = useSelector(selectAdminExpenses);

  useEffect(() => {
    dispatch(fetchCategoryTotals());
  }, [dispatch]);

  if (!categoryTotals) {
    return <div className="text-center text-gray-500">Loading chart...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (categoryTotals.length === 0) {
    return (
      <div className="text-center text-gray-500">No category data found.</div>
    );
  }

  // Normalize category names (case-insensitive merge)
  const normalizedData = categoryTotals.reduce((acc: any[], curr) => {
    const key = curr.category.toLowerCase();
    const existing = acc.find((item) => item.category.toLowerCase() === key);
    if (existing) {
      existing.total += curr.total;
    } else {
      acc.push({ ...curr, category: capitalizeWords(curr.category) });
    }
    return acc;
  }, []);

  return (
    <div className="bg-white rounded shadow p-4 sm:p-6 mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        Expense Distribution by Category
      </h2>
      <p className="text-sm text-gray-500 text-center mb-4">
        A visual summary of company expenses grouped by category.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={normalizedData}
            dataKey="total"
            nameKey="category"
            outerRadius={100}
            innerRadius={50}
            fill="#8884d8"
            label
          >
            {normalizedData.map((entry, idx) => (
              <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend layout="horizontal" verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TeamAnalytics() {
  const dispatch = useDispatch<AppDispatch>();
  const { userAnalytics, error } = useSelector(selectAdminExpenses);

  useEffect(() => {
    dispatch(fetchUserAnalytics());
  }, [dispatch]);

  if (!userAnalytics) {
    return (
      <div className="text-center text-gray-500">Loading team analytics...</div>
    );
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  if (userAnalytics.length === 0) {
    return <div className="text-center text-gray-500">No team data found.</div>;
  }

  const totalAllUsers = userAnalytics.reduce(
    (sum, user) => sum + Number(user.total || 0),
    0
  );

  return (
    <div className="bg-white rounded shadow p-4 sm:p-6 overflow-x-auto">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-center">
        Team-wise Expense Overview
      </h2>
      <p className="text-sm text-gray-500 text-center mb-4">
        A breakdown of total expenses submitted by each team member.
      </p>
      <table className="min-w-full border-collapse text-xs sm:text-sm md:text-base">
        <thead>
          <tr className="bg-blue-100">
            <th className="py-2 px-3 text-left whitespace-nowrap">User</th>
            <th className="py-2 px-3 text-right whitespace-nowrap">
              Total Expenses
            </th>
          </tr>
        </thead>
        <tbody>
          {userAnalytics.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              <td className="py-2 px-3 whitespace-nowrap">
                {user.name || user.username || "Unknown"}
              </td>
              <td className="py-2 px-3 text-right font-semibold text-green-600 whitespace-nowrap">
                ${Number(user.total).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100 font-bold">
            <td className="py-2 px-3 text-left">Total</td>
            <td className="py-2 px-3 text-right text-blue-700">
              ${totalAllUsers.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container max-w-5xl mx-auto p-4 sm:p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 text-center">
          Company-wide Expense Analytics
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
          Get a complete overview of all expenses submitted across your
          organization, including admin records. Leverage these insights to
          monitor, analyze, and approve requests efficiently.
        </p>
        <CategoryTotalsChart />
        <TeamAnalytics />
      </div>
    </div>
  );
}
