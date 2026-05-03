import { Routes, Route, Navigate } from "react-router";
import { trpc } from "@/providers/trpc";

// Layouts
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Public pages
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import DebugPage from "@/pages/DebugPage";

// Dashboard pages
import Overview from "@/pages/dashboard/Overview";
import ResumePage from "@/pages/dashboard/ResumePage";
import InterviewPage from "@/pages/dashboard/InterviewPage";
import JobsPage from "@/pages/dashboard/JobsPage";
import SkillsPage from "@/pages/dashboard/SkillsPage";
import PersonasPage from "@/pages/dashboard/PersonasPage";
import PricingPage from "@/pages/dashboard/PricingPage";
import OrdersPage from "@/pages/dashboard/OrdersPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/UsersPage";
import AdminApiSettings from "@/pages/admin/ApiSettings";
import AdminDatabase from "@/pages/admin/DatabasePage";
import AdminOrders from "@/pages/admin/OrdersPage";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, { retry: false });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#02040a] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, { retry: false });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#02040a] text-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Dashboard Routes */}
      <Route
        path="/dashboard/*"
        element={
          <AuthGuard>
            <DashboardLayout>
              <Routes>
                <Route index element={<Overview />} />
                <Route path="resume" element={<ResumePage />} />
                <Route path="interview" element={<InterviewPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="ai-personas" element={<PersonasPage />} />
                <Route path="pricing" element={<PricingPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Routes>
            </DashboardLayout>
          </AuthGuard>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="settings" element={<AdminApiSettings />} />
                <Route path="database" element={<AdminDatabase />} />
                <Route path="orders" element={<AdminOrders />} />
              </Routes>
            </AdminLayout>
          </AdminGuard>
        }
      />

      {/* Debug page - public */}
      <Route path="/debug" element={<DebugPage />} />

      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
