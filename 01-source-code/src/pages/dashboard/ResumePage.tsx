import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, Sparkles, Award, Target, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";

export default function ResumePage() {
  const [resumeContent, setResumeContent] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [optimized, setOptimized] = useState("");

  const analyzeMutation = trpc.resume.analyze.useMutation({
    onSuccess: (data) => { setScore(data); setAnalyzed(true); },
    onError: () => setAnalyzed(true),
  });
  const optimizeMutation = trpc.resume.optimize.useMutation({
    onSuccess: (data) => setOptimized(data.optimizedContent ?? ""),
  });

  const handleAnalyze = () => {
    if (!resumeContent.trim()) return;
    analyzeMutation.mutate({ content: resumeContent, jobDescription: jobDesc || undefined });
  };

  if (!analyzed) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">简历智析</h1>
          <p className="text-slate-400 text-sm">AI深度诊断你的职业DNA</p>
        </div>
        <textarea value={resumeContent} onChange={(e) => setResumeContent(e.target.value)}
          placeholder="在此粘贴你的简历内容..." rows={8}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
        <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
          placeholder="(可选) 目标岗位JD，AI将针对性优化" rows={3}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 resize-none" />
        <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f){ const r = new FileReader(); r.onload = (ev) => setResumeContent(ev.target?.result as string); r.readAsText(f); }}}
          onClick={() => document.getElementById("rf")?.click()}
          className="rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center cursor-pointer hover:border-white/20 transition-all">
          <input id="rf" type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = (ev) => setResumeContent(ev.target?.result as string); r.readAsText(f); } }} />
          <Upload size={28} className="text-blue-400 mx-auto mb-2" />
          <p className="text-sm text-slate-400">拖拽文件到此处上传</p>
        </div>
        {resumeContent.trim() && (
          <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-5 rounded-2xl">
            <Sparkles size={18} className="mr-2" />
            {analyzeMutation.isPending ? "分析中..." : "开始AI分析"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">分析结果</h1>
          <p className="text-slate-400 text-sm">{score?.summary ?? "分析完成"}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setAnalyzed(false); setScore(null); setOptimized(""); }}
          className="border-white/10 text-slate-300 hover:bg-white/5">
          <RefreshCw size={14} className="mr-1" />重新分析
        </Button>
      </div>

      <Tabs defaultValue="score">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="score" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">评分</TabsTrigger>
          <TabsTrigger value="suggestions" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">建议</TabsTrigger>
          <TabsTrigger value="optimized" className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">优化版</TabsTrigger>
        </TabsList>

        <TabsContent value="score" className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "综合评分", value: score?.overall ?? 78, icon: Star },
              { label: "结构排版", value: score?.structure ?? 82, icon: FileText },
              { label: "关键词匹配", value: score?.keywords ?? 65, icon: Target },
              { label: "成果影响", value: score?.impact ?? 72, icon: Award },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl glass-card p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-3">
                  <s.icon size={18} />
                </div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4 space-y-3">
          {(score?.suggestions ?? []).map((s: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`rounded-xl glass-card p-4 border-l-4 ${s.type === "critical" ? "border-l-red-400" : s.type === "good" ? "border-l-emerald-400" : "border-l-amber-400"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm">{s.title}</span>
                <Badge variant="outline" className={`text-[10px] ${s.type === "critical" ? "border-red-500/30 text-red-400" : s.type === "good" ? "border-emerald-500/30 text-emerald-400" : "border-amber-500/30 text-amber-400"}`}>
                  {s.type === "critical" ? "重要" : s.type === "good" ? "优秀" : "建议"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{s.description}</p>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="optimized" className="mt-4">
          <div className="rounded-2xl glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">AI优化版简历</h3>
              {!optimized && (
                <Button size="sm" onClick={() => optimizeMutation.mutate({ content: resumeContent })}
                  disabled={optimizeMutation.isPending} className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Sparkles size={14} className="mr-1" />
                  {optimizeMutation.isPending ? "生成中..." : "生成优化版"}
                </Button>
              )}
            </div>
            <div className="bg-[#0a0e1a] rounded-xl p-4 border border-white/5 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto font-mono">
              {optimized || "点击「生成优化版」按钮，AI将为你重写一份专业简历"}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
