import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../features/auth/pages/Login";

// Admin Pages
import AdminDashboard from "../features/admin/pages/Dashboard";
import Students from "../features/admin/pages/Students";
import StudentDetails from "../features/admin/pages/StudentDetails";
import Tutors from "../features/admin/pages/Tutors";
import TutorSalaryReport from "../features/admin/pages/TutorSalaryReport";
import Requests from "../features/admin/pages/Requests";

// Student Pages
import StudentDashboard from "../features/student/pages/Dashboard";
import StudentClasses from "../features/student/pages/Classes";
import StudentRequests from "../features/student/pages/Requests";
import StudentTests from "../features/student/pages/Tests";
import RequestClass from "../features/student/pages/RequestClass";

// Tutor Pages
import TutorDashboard from "../features/tutor/pages/Dashboard";
import TutorClasses from "../features/tutor/pages/Classes";

// Layouts
import AdminLayout from "../components/layout/AdminLayout";
import StudentLayout from "../components/layout/StudentLayout";
import TutorLayout from "../components/layout/TutorLayout";

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
          <Route path="tutors" element={<Tutors />} />
          <Route path="tutors/salary-report" element={<TutorSalaryReport />} />
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

        {/* Tutor */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute role="tutor">
              <TutorLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<TutorDashboard />} />
          <Route path="classes" element={<TutorClasses />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}