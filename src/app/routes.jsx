import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../features/auth/pages/Login";

// Admin Pages
import AdminDashboard from "../features/admin/pages/Dashboard";
import Students from "../features/admin/pages/Students";
import StudentDetails from "../features/admin/pages/StudentDetails";
import Requests from "../features/admin/pages/Requests";

// Student Pages
import StudentDashboard from "../features/student/pages/Dashboard";
import StudentClasses from "../features/student/pages/Classes";
import StudentRequests from "../features/student/pages/Requests";
import StudentTests from "../features/student/pages/Tests";
import RequestClass from "../features/student/pages/RequestClass";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";

// Auth Guard
import ProtectedRoute from "../components/ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetails />} />
          <Route path="requests" element={<Requests />} />
        </Route>

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="classes" element={<StudentClasses />} />
          <Route path="classes/request" element={<RequestClass />} />
          <Route path="requests" element={<StudentRequests />} />
          <Route path="tests" element={<StudentTests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}