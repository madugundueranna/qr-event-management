import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Redirects logged-in users away from guest-only pages (login, register)
function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    const role = user?.role;
    if (role === "Admin") return <Navigate to="/admin" replace />;
    if (role === "Organizer") return <Navigate to="/organizer/dashboard" replace />;
    return <Navigate to="/attendee/dashboard" replace />;
  }

  return children;
}

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import ForgotPassword from "../pages/public/ForgotPassword";
import ResetPassword from "../pages/public/ResetPassword";
import Home from "../pages/public/Home"; // will serve as Events Home
import Properties from "../pages/public/Properties"; // will become Events List
import PropertyDetails from "../pages/public/PropertyDetails"; // will become Event Details
import CustomerDashboard from "../pages/public/CustomerDashboard"; // Attendee Dashboard
import MyFavorites from "../pages/attendee/MyFavorites";

import CategoryEvents from "../pages/public/CategoryEvents";
import AboutUs from "../pages/public/AboutUs";
import Careers from "../pages/public/Careers";
import Blog from "../pages/public/Blog";
import BlogPost from "../pages/public/BlogPost";
import Press from "../pages/public/Press";
import HelpCenter from "../pages/public/HelpCenter";
import ContactUs from "../pages/public/ContactUs";
import ReportIssue from "../pages/public/ReportIssue";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";
import TermsOfUse from "../pages/public/TermsOfUse";

import AddProperty from "../pages/seller/AddProperty"; // Add Event
import SellerDashboard from "../pages/seller/SellerDashboard"; // Organizer Dashboard

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminProperties from "../pages/admin/AdminProperties";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminReports from "../pages/admin/AdminReports";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminContent from "../pages/admin/AdminContent";
import AdminSubmissions from "../pages/admin/AdminSubmissions";

// ─── OAuth Callback Handler ───────────────────────────────────────────────────
function AuthSuccessCallback() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    loginWithGoogle().then((res) => {
      if (res.success) {
        const role = res.user?.role;
        if (role === "Admin") {
          navigate("/admin", { replace: true });
        } else if (role === "Organizer") {
          navigate("/organizer/dashboard", { replace: true });
        } else {
          navigate("/attendee/dashboard", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    });
  }, [loginWithGoogle, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Completing authentication...</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/auth/success" element={<AuthSuccessCallback />} />

      <Route path="/events" element={<Properties />} />
      <Route path="/events/category/:category" element={<CategoryEvents />} />
      <Route path="/events/:id" element={<PropertyDetails />} />

      {/* Footer – Company */}
      <Route path="/about"   element={<AboutUs />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/blog"       element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/press"   element={<Press />} />

      {/* Footer – Support */}
      <Route path="/help"         element={<HelpCenter />} />
      <Route path="/contact"      element={<ContactUs />} />
      <Route path="/report-issue" element={<ReportIssue />} />
      <Route path="/privacy"      element={<PrivacyPolicy />} />
      <Route path="/terms"        element={<TermsOfUse />} />

      {/* Attendee / User Routes */}
      <Route
        path="/attendee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["User", "Admin"]}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendee/favorites"
        element={
          <ProtectedRoute allowedRoles={["User", "Admin"]}>
            <MyFavorites />
          </ProtectedRoute>
        }
      />

      {/* Organizer Routes */}
      <Route
        path="/organizer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Organizer", "Admin"]}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer/add-event"
        element={
          <ProtectedRoute allowedRoles={["Organizer", "Admin"]}>
            <AddProperty />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminContent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/submissions"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminSubmissions />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
