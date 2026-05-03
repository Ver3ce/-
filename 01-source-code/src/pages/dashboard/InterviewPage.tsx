import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Bot, User, Play, RotateCcw, CheckCircle2, TrendingUp, Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/providers/trpc";

export default function InterviewPage() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(0);
  const [jobType, setJobType] = useState("前端工程师");
  const [score, setScore] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const startMut = trpc.interview.start.useMutation({
    onSuccess: (d) => { setSessionId(d.sessionId); setMessages(d.messages); setStarted(true); setCompleted(false); },
  });
  const sendMut = trpc.interview.sendMessage.useMutation({
    onSuccess: (d) => setMessages(d.messages),
  });
  const completeMut = trpc.interview.complete.useMutation({
    onSuccess: (d) => { setScore(d); setCompleted(true); },
  });

  const handleSend = () => {
    if (!input.trim() || !sessionId) return;
    setMessages(p => [...p, { role: "user", content: input }]);
    sendMut.mutate({ sessionId, message: input });
    setInput("");
  };
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">模拟面试</h1>
          <p className="text-slate-400 text-sm">选择目标岗位，开始1v1沉浸式面试训练</p>
        </div>
        <div className="rounded-2xl glass-card p-6">
          <label className="text-sm text-slate-400 mb-3 block">选择目标岗位</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {["前端工程师", "后端工程师", "产品经理", "数据分析师", "UI设计师"].map(t => (
              <button key={t} onClick={() => setJobType(t)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${jobType === t ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"}`}>
                {t}
              </button>
            ))}
          </div>
          <Button onClick={() => startMut.mutate({ jobType })} disabled={startMut.isPending}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-5 rounded-2xl">
            <Play size={18} className="mr-2" />
            {startMut.isPending ? "准备中..." : "开始面试"}
          </Button>
        </div>
      </div>
    );
  }

  if (completed && score) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">面试报告</h1>
          <Button size="sm" onClick={() => { setStarted(false); setCompleted(false); setScore(null); setMessages([]); }}
            className="bg-purple-500 hover:bg-purple-600 text-white">
            <RotateCcw size={14} className="mr-1" />再来一次
          </Button>
        </div>
        <div className="rounded-2xl glass-card p-6 text-center">
          <div className="text-5xl font-bold text-white mb-2">{score.overall ?? 85}</div>
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">面试完成</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "沟通表达", value: score.communication ?? 88, icon: MessageSquare },
            { label: "逻辑结构", value: score.logic ?? 82, icon: TrendingUp },
            { label: "技术深度", value: score.technical ?? 86, icon: Star },
            { label: "态度表现", value: score.attitude ?? 90, icon: ThumbsUp },
          ].map(s => (
            <div key={s.label} className="rounded-xl glass-card p-4">
              <div className="flex items-center gap-2 mb-2"><s.icon size={14} className="text-slate-400" /><span className="text-sm text-slate-300">{s.label}</span></div>
              <span className={`text-2xl font-bold ${s.value >= 85 ? "text-emerald-400" : "text-amber-400"}`}>{s.value}</span>
              <Progress value={s.value} className="mt-2 h-1 bg-white/5" />
            </div>
          ))}
        </div>
        {score.tips && (
          <div className="rounded-2xl glass-card p-5">
            <h3 className="font-semibold text-white mb-3">改进建议</h3>
            {score.tips.map((tip: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-2">
                <CheckCircle2 size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const qCount = messages.filter((m: any) => m.role === "ai" && m.type === "question").length;
  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">模拟面试 · {jobType}</h1>
        <span className="text-sm text-slate-400">题目 {qCount}/5</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          animate={{ width: `${Math.min(qCount / 5 * 100, 100)}%` }} />
      </div>
      <div className="flex-1 rounded-2xl glass-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg: any, i: number) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.role === "ai" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                {msg.role === "ai" ? <Bot size={12} className="text-purple-400" /> : <User size={12} className="text-blue-400" />}
              </div>
              <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${msg.role === "ai" ? "bg-white/5 text-slate-300" : "bg-blue-500/10 text-blue-100"}`}>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </div>
          ))}
          {(sendMut.isPending || completeMut.isPending) && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center"><Bot size={12} className="text-purple-400 animate-pulse" /></div>
              <div className="bg-white/5 rounded-xl px-3 py-2 text-sm text-slate-400">思考中...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-white/5 p-3">
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="输入回答..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50" />
            <Button onClick={handleSend} disabled={!input.trim() || sendMut.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-4"><Send size={14} /></Button>
          </div>
          {qCount >= 5 && (
            <div className="mt-2 text-center">
              <Button variant="outline" size="sm" onClick={() => completeMut.mutate({ sessionId })}
                disabled={completeMut.isPending} className="border-emerald-500/30 text-emerald-400">
                <CheckCircle2 size={14} className="mr-1" />
                {completeMut.isPending ? "评分中..." : "结束面试"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
