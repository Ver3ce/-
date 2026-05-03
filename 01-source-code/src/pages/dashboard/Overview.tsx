import { motion } from "framer-motion";
import { FileText, MessageSquare, Radar, BarChart3, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";

const quickActions = [
  { title: "简历智析", desc: "AI深度诊断简历，获取评分和优化建议", icon: FileText, path: "/dashboard/resume", color: "blue" },
  { title: "模拟面试", desc: "沉浸式面试训练，即时评分反馈", icon: MessageSquare, path: "/dashboard/interview", color: "purple" },
  { title: "岗位雷达", desc: "全网追踪高匹配度职位", icon: Radar, path: "/dashboard/jobs", color: "emerald" },
  { title: "技能图谱", desc: "全面评估技能水平与成长路径", icon: BarChart3, path: "/dashboard/skills", color: "amber" },
];

const tips = [
  "完善个人资料后，岗位推荐会更精准",
  "模拟面试支持5种不同岗位类型",
  "简历优化会针对目标岗位JD进行关键词匹配",
  "在专属AI页面可以创建自己的AI助手",
];

export default function Overview() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
        <p className="text-slate-400">选择一个功能开始你的求职之旅</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={action.path}
              className="block rounded-2xl glass-card p-6 hover:border-blue-500/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon size={22} className={`text-${action.color}-400`} />
              </div>
              <h3 className="font-semibold text-white mb-1">{action.title}</h3>
              <p className="text-sm text-slate-400">{action.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-amber-400" />
          <h3 className="font-semibold text-white">使用小贴士</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <Sparkles size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
