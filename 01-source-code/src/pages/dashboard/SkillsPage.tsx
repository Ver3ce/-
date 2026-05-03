import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Star, AlertTriangle, BookOpen, Brain, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function SkillsPage() {
  const [skillsInput, setSkillsInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const analyzeMut = trpc.skill.analyze.useMutation({
    onSuccess: () => setAnalyzed(true),
    onError: () => setAnalyzed(true),
  });

  const handleAnalyze = () => {
    const skills = skillsInput.split(/[,，\n]/).map(s => {
      const p = s.trim().split(/[:：]/);
      return { name: p[0]?.trim() ?? "", level: parseInt(p[1]?.trim() ?? "50") };
    }).filter(s => s.name);
    if (skills.length === 0) { setAnalyzed(true); return; }
    analyzeMut.mutate({ skills, targetRole: targetRole || undefined });
  };

  const data = analyzeMut.data;
  const skills = data?.skills ?? [];
  const gaps = data?.gaps ?? [];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">技能图谱</h1>
        <p className="text-slate-400 text-sm">全方位技能评估，精准定位短板</p>
      </div>

      {!analyzed ? (
        <div className="max-w-lg mx-auto rounded-2xl glass-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400"><Brain size={20} /></div>
            <div><h3 className="font-semibold text-white">技能分析</h3><p className="text-xs text-slate-400">输入技能栈，AI全面评估</p></div>
          </div>
          <textarea value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)}
            placeholder={"React: 90\nTypeScript: 85\nNode.js: 70"} rows={6}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 resize-none" />
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            placeholder="目标岗位（可选）" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50" />
          <Button onClick={handleAnalyze} disabled={analyzeMut.isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl">
            {analyzeMut.isPending ? "分析中..." : "开始分析"}
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "技能数", value: skills.length, icon: <Brain size={14} />, c: "blue" },
              { label: "核心优势", value: skills.filter((s: any) => s.level >= 85).length, icon: <Star size={14} />, c: "emerald" },
              { label: "待提升", value: skills.filter((s: any) => s.level < 70).length, icon: <AlertTriangle size={14} />, c: "amber" },
              { label: "差距项", value: gaps.length, icon: <Target size={14} />, c: "purple" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl glass-card p-4 text-center">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-2">{s.icon}</div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Brain size={16} className="text-blue-400" />技能雷达</h3>
              <div className="space-y-3">
                {skills.map((s: any, i: number) => (
                  <motion.div key={s.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{s.name}</span>
                      <span className="text-slate-400">{s.level}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${s.level >= 85 ? "bg-emerald-500" : s.level >= 60 ? "bg-blue-500" : "bg-amber-500"}`}
                        initial={{ width: 0 }} animate={{ width: `${s.level}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl glass-card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Target size={16} className="text-amber-400" />能力差距</h3>
              <div className="space-y-3">
                {gaps.map((g: any, i: number) => (
                  <motion.div key={g.skill} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                    className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white">{g.skill}</span>
                      <Badge variant="outline" className={`text-[10px] ${g.priority === "high" ? "border-red-500/30 text-red-400" : "border-amber-500/30 text-amber-400"}`}>
                        {g.priority === "high" ? "优先" : "建议"}
                      </Badge>
                    </div>
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                      <div className="absolute h-full bg-amber-500/20 rounded-full" style={{ width: `${g.target}%` }} />
                      <motion.div className="absolute h-full bg-amber-500 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${g.current}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <BookOpen size={9} /><span>{g.resource}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setAnalyzed(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"><Zap size={14} className="mr-2" />重新分析</Button>
          </div>
        </>
      )}
    </div>
  );
}
