import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Plus, Sparkles, Trash2, FileText, MessageSquare, Compass, BarChart3, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORY_LABELS: Record<string, string> = { resume: "简历优化", interview: "面试辅导", career: "职业规划", skill: "技能分析", custom: "自定义" };
const CATEGORY_COLORS: Record<string, string> = { resume: "text-blue-400 bg-blue-500/10 border-blue-500/20", interview: "text-purple-400 bg-purple-500/10 border-purple-500/20", career: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", skill: "text-amber-400 bg-amber-500/10 border-amber-500/20", custom: "text-pink-400 bg-pink-500/10 border-pink-500/20" };

const PRESETS = [
  { name: "简历优化师", desc: "资深HR视角，帮你打造完美简历", icon: <FileText size={20} />, category: "resume", color: "blue" },
  { name: "面试教练", desc: "模拟真实面试场景，提供即时反馈", icon: <MessageSquare size={20} />, category: "interview", color: "purple" },
  { name: "职业顾问", desc: "规划职业发展路径，提供行业洞察", icon: <Compass size={20} />, category: "career", color: "emerald" },
  { name: "技能分析师", desc: "全面评估技能水平，制定成长计划", icon: <BarChart3 size={20} />, category: "skill", color: "amber" },
];

export default function PersonasPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", systemPrompt: "", category: "custom" });
  const { data: personas, refetch } = trpc.persona.list.useQuery();
  const createMut = trpc.persona.create.useMutation({ onSuccess: () => { refetch(); setOpen(false); setForm({ name: "", description: "", systemPrompt: "", category: "custom" }); } });
  const deleteMut = trpc.persona.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">专属AI</h1>
        <p className="text-slate-400 text-sm">选择预设角色或创建自定义AI助手</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Sparkles size={16} className="text-blue-400" />系统预设</h3>
        <div className="grid grid-cols-4 gap-3">
          {PRESETS.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl glass-card p-5 hover:border-blue-500/30 transition-all">
              <div className={`w-10 h-10 rounded-lg bg-${p.color}-500/10 flex items-center justify-center text-${p.color}-400 mb-3`}>{p.icon}</div>
              <h4 className="font-medium text-white text-sm mb-1">{p.name}</h4>
              <p className="text-xs text-slate-400 mb-2">{p.desc}</p>
              <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[p.category]}`}>{CATEGORY_LABELS[p.category]}</Badge>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Wand2 size={16} className="text-pink-400" />我的自定义角色</h3>
          <Button size="sm" onClick={() => setOpen(true)} className="bg-pink-500 hover:bg-pink-600 text-white rounded-lg"><Plus size={14} className="mr-1" />创建</Button>
        </div>
        {personas && personas.filter(p => p.isCustom).length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {personas.filter(p => p.isCustom).map(p => (
              <div key={p.id} className="rounded-xl glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div><h4 className="font-medium text-white text-sm">{p.name}</h4><p className="text-xs text-slate-400">{p.description}</p></div>
                  <button onClick={() => deleteMut.mutate({ id: p.id })} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400"><Trash2 size={12} /></button>
                </div>
                <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[p.category ?? "custom"]}`}>{CATEGORY_LABELS[p.category ?? "custom"]}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl glass-card p-8 text-center"><Bot size={32} className="text-slate-600 mx-auto mb-2" /><p className="text-slate-400 text-sm">还没有自定义角色</p></div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0a0f1e] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white">创建AI角色</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="角色名称" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50" />
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="描述" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (<option key={k} value={k} className="bg-[#0a0f1e]">{v}</option>))}
            </select>
            <textarea value={form.systemPrompt} onChange={e => setForm({ ...form, systemPrompt: e.target.value })} placeholder="System Prompt：定义AI的专业身份和行为模式" rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500/50 resize-none" />
            <Button onClick={() => { if (form.name && form.systemPrompt) createMut.mutate({ name: form.name, description: form.description, systemPrompt: form.systemPrompt, category: form.category as any }); }}
              disabled={!form.name || !form.systemPrompt} className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl">
              <Plus size={14} className="mr-1" />创建角色
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
