import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useCallback } from "react";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import type { RootState } from "../../redux/store";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
    navigate("/login");
  }, [dispatch, navigate]);

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
          <Link
            to="/expenses"
            className="text-white text-xl sm:text-2xl font-bold"
          >
            Expense Tracker
          </Link>
          {user && user.role === "admin" && (
            <div className="flex gap-2 sm:gap-4">
              <Link
                to="/admin/expenses"
                className="text-white text-base sm:text-lg font-semibold hover:underline transition"
              >
                Admin Panel
              </Link>
              <Link
                to="/admin/dashboard"
                className="text-white text-base sm:text-lg font-semibold hover:underline transition"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          {user && (
            <span className="text-white text-sm sm:text-base">
              Welcome, {user.name || user.username}!
            </span>
          )}
          <button
            onClick={handleLogout}
            className="cursor-pointer bg-white text-blue-600 px-3 sm:px-4 py-2 rounded font-semibold hover:bg-gray-100 transition w-full sm:w-auto"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
