import { useState } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, MessageSquare, Radar, BarChart3, Bot,
  ShoppingBag, Settings, LayoutDashboard, LogOut, User,
  ChevronLeft, ChevronRight, Shield, Sparkles
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const navItems = [
  { path: "/dashboard", label: "概览", icon: LayoutDashboard },
  { path: "/dashboard/resume", label: "简历智析", icon: FileText },
  { path: "/dashboard/interview", label: "模拟面试", icon: MessageSquare },
  { path: "/dashboard/jobs", label: "岗位雷达", icon: Radar },
  { path: "/dashboard/skills", label: "技能图谱", icon: BarChart3 },
  { path: "/dashboard/ai-personas", label: "专属AI", icon: Bot },
  { path: "/dashboard/pricing", label: "服务套餐", icon: ShoppingBag },
  { path: "/dashboard/orders", label: "我的订单", icon: Sparkles },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { data: user } = trpc.auth.me.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex h-screen bg-[#02040a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-white/5 bg-[#0a0f1e]/80 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 h-16 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-gradient-hero">极光职途</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={isActive ? "text-blue-400" : ""} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Admin Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mt-4 ${
                collapsed ? "justify-center" : ""
              } ${
                location.pathname.startsWith("/admin")
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                  : "text-amber-400/70 hover:bg-amber-500/10 hover:text-amber-400"
              }`}
              title={collapsed ? "管理后台" : undefined}
            >
              <Shield size={18} />
              {!collapsed && <span>管理后台</span>}
            </Link>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/5 space-y-1">
          <Link
            to="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <Settings size={18} />
            {!collapsed && <span>设置</span>}
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              utils.invalidate();
              window.location.href = "/login";
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>退出</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 transition-all ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> <span>收起</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0f1e]/50 backdrop-blur-sm">
          <div className="text-sm text-slate-500">
            {navItems.find((n) => n.path === location.pathname)?.label ?? "极光职途"}
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
                管理员
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <User size={16} className="text-slate-400" />
              )}
              <span className="text-slate-300">{user?.name ?? "用户"}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
