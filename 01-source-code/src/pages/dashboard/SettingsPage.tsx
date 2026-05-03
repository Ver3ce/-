import { useState } from "react";
import { motion } from "framer-motion";
import { User, Target, GraduationCap, Wallet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function SettingsPage() {
  const { data: profile } = trpc.job.getProfile.useQuery();
  const { data: apiStatus } = trpc.system.getApiKey.useQuery();
  const [form, setForm] = useState({
    targetRole: profile?.targetRole ?? "",
    targetIndustry: profile?.targetIndustry ?? "",
    targetLocation: profile?.targetLocation ?? "",
    expectedSalary: profile?.expectedSalary ?? "",
    experience: profile?.experience ?? "",
    education: profile?.education ?? "",
  });

  const updateProfile = trpc.job.updateProfile.useMutation({
    onSuccess: () => alert("保存成功"),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">个人设置</h1>
        <p className="text-slate-400 text-sm">完善你的求职档案，获取更精准的推荐</p>
      </div>

      {/* Profile Settings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={18} className="text-blue-400" />
          <h3 className="font-semibold text-white">求职档案</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">目标岗位</label>
            <div className="relative">
              <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} placeholder="前端工程师"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">目标行业</label>
            <input value={form.targetIndustry} onChange={e => setForm({ ...form, targetIndustry: e.target.value })} placeholder="互联网"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">期望城市</label>
            <input value={form.targetLocation} onChange={e => setForm({ ...form, targetLocation: e.target.value })} placeholder="北京"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">期望薪资</label>
            <div className="relative">
              <Wallet size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={form.expectedSalary} onChange={e => setForm({ ...form, expectedSalary: e.target.value })} placeholder="30-50K"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">工作年限</label>
            <input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="3-5年"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">学历</label>
            <div className="relative">
              <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} placeholder="本科"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
        </div>

        <Button onClick={() => updateProfile.mutate(form)} disabled={updateProfile.isPending}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
          {updateProfile.isPending ? "保存中..." : "保存档案"}
        </Button>
      </motion.div>

      {/* AI Status */}
      <div className="rounded-2xl glass-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-emerald-400" />
          <h3 className="font-semibold text-white">AI 服务状态</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${apiStatus?.configured ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="text-sm text-slate-300">
            {apiStatus?.configured ? `AI 服务正常运行 (${apiStatus.key})` : "AI 服务运行中（模拟模式）"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {apiStatus?.configured
            ? "管理员已配置 AI API，所有用户均可使用。"
            : "管理员尚未配置 AI API Key，当前使用模拟模式。请联系管理员配置。"}
        </p>
      </div>
    </div>
  );
}
