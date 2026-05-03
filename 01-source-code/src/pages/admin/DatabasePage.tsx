import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TABLES = [
  { name: "users", desc: "用户表", columns: ["id", "unionId", "name", "email", "avatar", "role", "createdAt"] },
  { name: "user_profiles", desc: "用户画像", columns: ["id", "userId", "targetRole", "targetIndustry", "skills", "experience", "education"] },
  { name: "resumes", desc: "简历分析", columns: ["id", "userId", "filename", "content", "score", "status", "createdAt"] },
  { name: "interview_sessions", desc: "面试会话", columns: ["id", "userId", "title", "jobType", "status", "score", "createdAt"] },
  { name: "ai_personas", desc: "AI角色", columns: ["id", "name", "description", "systemPrompt", "category", "isDefault", "userId"] },
  { name: "products", desc: "产品/服务", columns: ["id", "name", "description", "price", "type", "features", "isActive"] },
  { name: "orders", desc: "订单", columns: ["id", "userId", "orderNo", "productId", "amount", "status", "payType", "payTime"] },
  { name: "saved_jobs", desc: "收藏岗位", columns: ["id", "userId", "externalId", "jobData", "createdAt"] },
  { name: "system_settings", desc: "系统设置", columns: ["id", "key", "value", "description", "updatedBy"] },
];

export default function AdminDatabase() {
  const [selected, setSelected] = useState(TABLES[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database size={20} className="text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">数据库</h1>
          <p className="text-slate-400 text-sm">查看数据库表结构</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {TABLES.map(t => (
          <motion.button key={t.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(t)}
            className={`rounded-xl glass-card p-4 text-left transition-all ${selected.name === t.name ? "border-blue-500/30 bg-blue-500/5" : ""}`}>
            <div className="flex items-center gap-2 mb-1">
              <Table size={14} className="text-slate-400" />
              <span className="font-medium text-white text-sm">{t.name}</span>
            </div>
            <p className="text-xs text-slate-500">{t.desc}</p>
            <Badge variant="outline" className="mt-2 text-[10px] border-slate-500/20 text-slate-400">{t.columns.length} 字段</Badge>
          </motion.button>
        ))}
      </div>

      <motion.div key={selected.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass-card p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Table size={16} className="text-blue-400" />
          {selected.name} <span className="text-slate-400 text-sm font-normal">({selected.desc})</span>
        </h3>
        <div className="rounded-xl bg-[#0a0e1a] border border-white/5 overflow-hidden">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-white/5"><th className="text-left px-4 py-2 text-slate-400">字段名</th><th className="text-left px-4 py-2 text-slate-400">说明</th></tr></thead>
            <tbody>{selected.columns.map(col => (
              <tr key={col} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-2 text-blue-300 font-mono">{col}</td>
                <td className="px-4 py-2 text-slate-400">{col === "id" ? "主键" : col === "createdAt" ? "创建时间" : col === "updatedAt" ? "更新时间" : "-"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
