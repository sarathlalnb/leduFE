import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  let user = null;
  try {
    const userJson = localStorage.getItem("user");
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    // Invalid JSON in localStorage, proceed without user
  }

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;