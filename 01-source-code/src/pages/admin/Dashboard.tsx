import { motion } from "framer-motion";
import { Users, FileText, MessageSquare, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function AdminDashboard() {
  const { data: stats } = trpc.admin.stats.useQuery();

  const cards = [
    { label: "总用户", value: stats?.users ?? 0, icon: Users, color: "blue" },
    { label: "简历分析", value: stats?.resumes ?? 0, icon: FileText, color: "emerald" },
    { label: "模拟面试", value: stats?.interviews ?? 0, icon: MessageSquare, color: "purple" },
    { label: "总订单", value: stats?.orders ?? 0, icon: ShoppingBag, color: "amber" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">仪表盘</h1>
        <p className="text-slate-400 text-sm">系统概览与数据统计</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-${c.color}-500/10 flex items-center justify-center text-${c.color}-400 mb-3`}>
              <c.icon size={20} />
            </div>
            <div className="text-3xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-slate-400">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-white">收入概览</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">¥{stats?.revenue ?? 0}</div>
          <p className="text-xs text-slate-400">累计收入</p>
        </div>
        <div className="rounded-2xl glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">今日活跃</h3>
          </div>
          <div className="text-4xl font-bold text-white mb-1">--</div>
          <p className="text-xs text-slate-400">待接入统计</p>
        </div>
      </div>
    </div>
  );
}
