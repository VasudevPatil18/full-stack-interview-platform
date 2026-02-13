import { useAuth } from "./context/AuthContext";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import AuthPage from "./pages/AuthPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SchedulePage from "./pages/SchedulePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminSessionsPage from "./pages/AdminSessionsPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";

function App() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  const isAdmin = user?.role === "admin";

  return (
    <>
      <Routes>
        <Route path="/" element={!isAuthenticated ? <HomePage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPasswordPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to={"/auth"} />} />

        <Route path="/problems" element={isAuthenticated ? <ProblemsPage /> : <Navigate to={"/auth"} />} />
        <Route path="/problem/:id" element={isAuthenticated ? <ProblemPage /> : <Navigate to={"/auth"} />} />
        <Route path="/session/:id" element={isAuthenticated ? <SessionPage /> : <Navigate to={"/auth"} />} />
        <Route path="/schedule" element={isAuthenticated ? <SchedulePage /> : <Navigate to={"/auth"} />} />

        {/* Admin Routes */}
        <Route path="/admin" element={isAuthenticated && isAdmin ? <AdminDashboardPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/admin/users" element={isAuthenticated && isAdmin ? <AdminUsersPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/admin/sessions" element={isAuthenticated && isAdmin ? <AdminSessionsPage /> : <Navigate to={"/dashboard"} />} />
        <Route path="/admin/analytics" element={isAuthenticated && isAdmin ? <AdminAnalyticsPage /> : <Navigate to={"/dashboard"} />} />
      </Routes>

      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        toastOptions={{ 
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 9999,
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
        }} 
      />
    </>
  );
}

export default App;
