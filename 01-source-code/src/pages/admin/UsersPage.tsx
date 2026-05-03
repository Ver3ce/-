import { motion } from "framer-motion";
import { Users, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

export default function AdminUsers() {
  const { data: userList } = trpc.admin.listUsers.useQuery({});
  const updateRole = trpc.admin.updateUserRole.useMutation();
  const users = (userList ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">用户管理</h1>
          <p className="text-slate-400 text-sm">管理系统用户及其权限</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Users size={16} />
          <span>共 {users.length} 位用户</span>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-slate-400 font-medium">ID</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">用户</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">角色</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">注册时间</th>
              <th className="text-left px-4 py-3 text-slate-400 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-slate-500">{u.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.avatar ? <img src={u.avatar} className="w-7 h-7 rounded-full" /> : <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center"><User size={12} className="text-slate-400" /></div>}
                    <span className="text-white">{u.name ?? "未命名"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={u.role === "admin" ? "border-amber-500/30 text-amber-400" : "border-blue-500/30 text-blue-400"}>
                    {u.role === "admin" ? <><Shield size={10} className="mr-1" />管理员</> : "用户"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => updateRole.mutate({ userId: u.id, role: u.role === "admin" ? "user" : "admin" })}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    {u.role === "admin" ? "降为普通用户" : "设为管理员"}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
