import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, FileText, MessageSquare, ShoppingBag,
  Settings, BarChart3, ArrowLeft, Database
} from "lucide-react";

const adminNav = [
  { path: "/admin", label: "仪表盘", icon: BarChart3 },
  { path: "/admin/users", label: "用户管理", icon: Users },
  { path: "/admin/resumes", label: "简历管理", icon: FileText },
  { path: "/admin/interviews", label: "面试记录", icon: MessageSquare },
  { path: "/admin/orders", label: "订单管理", icon: ShoppingBag },
  { path: "/admin/database", label: "数据库", icon: Database },
  { path: "/admin/settings", label: "系统设置", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#02040a] text-white overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-56 flex flex-col border-r border-amber-500/10 bg-[#0a0f1e]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 h-16 border-b border-amber-500/10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-amber-400">管理后台</span>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-amber-500/10">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
            <span>返回用户端</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-amber-500/10 flex items-center justify-between px-6 bg-[#0a0f1e]/50">
          <div className="text-sm text-amber-400/70">
            {adminNav.find((n) => n.path === location.pathname)?.label ?? "管理后台"}
          </div>
          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
            管理员模式
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
