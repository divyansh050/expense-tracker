import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Expenses from "../pages/Expenses";
import AdminExpenses from "../pages/AdminExpenses";
import AdminDashboard from "../pages/AdminDashboard";
import Navbar from "../components/Navbar";

// Inline Layout component with Navbar + Outlet
const Layout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <Outlet />
  </div>
);

export default function AppRoutes() {
  const { token, user } = useSelector((state: any) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (No Navbar) */}
        <Route
          path="/login"
          element={token ? <Navigate to="/expenses" /> : <Login />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/expenses" /> : <Signup />}
        />

        {/* Protected Routes with Navbar via Layout */}
        {token && (
          <Route element={<Layout />}>
            <Route path="/expenses" element={<Expenses />} />
            {user?.role === "admin" && (
              <>
                <Route path="/admin/expenses" element={<AdminExpenses />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </>
            )}
          </Route>
        )}

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to={token ? "/expenses" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}
