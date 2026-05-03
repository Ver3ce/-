import { useState } from "react";
import { motion } from "framer-motion";
import { Radar, MapPin, Building2, DollarSign, Clock, Target, Bookmark, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

export default function JobsPage() {
  const [filter, setFilter] = useState<"all" | "high-match">("all");
  const { data: jobs, isLoading } = trpc.job.list.useQuery({ filter });
  const { data: profile } = trpc.job.getProfile.useQuery();
  const [showProfileForm, setShowProfileForm] = useState(!profile);
  const [profileData, setProfileData] = useState({ targetRole: "", targetLocation: "", skills: "" });

  const updateProfile = trpc.job.updateProfile.useMutation({
    onSuccess: () => { setShowProfileForm(false); window.location.reload(); },
  });

  if (showProfileForm) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">完善求职意向</h1>
          <p className="text-slate-400 text-sm">告诉我们你的目标，获取精准推荐</p>
        </div>
        <div className="rounded-2xl glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">目标岗位</label>
            <input value={profileData.targetRole} onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
              placeholder="例如：前端工程师" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">期望城市</label>
            <input value={profileData.targetLocation} onChange={(e) => setProfileData({ ...profileData, targetLocation: e.target.value })}
              placeholder="例如：北京" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">技能标签（逗号分隔）</label>
            <input value={profileData.skills} onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
              placeholder="React, TypeScript, Node.js" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <Button onClick={() => updateProfile.mutate({
            targetRole: profileData.targetRole,
            targetLocation: profileData.targetLocation,
            skills: profileData.skills.split(",").map(s => s.trim()).filter(Boolean),
          })} disabled={updateProfile.isPending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl">
            {updateProfile.isPending ? "保存中..." : "保存并开始推荐"}
          </Button>
        </div>
      </div>
    );
  }

  const jobList = (jobs ?? []) as any[];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">岗位雷达</h1>
          <p className="text-slate-400 text-sm">{profile?.targetRole ? `为你推荐「${profile.targetRole}」相关岗位` : "个性化岗位推荐"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowProfileForm(true)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 transition-all">
            <Target size={12} className="inline mr-1" />修改意向
          </button>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
            {(["all", "high-match"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === f ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}`}>
                {f === "all" ? "全部" : "高匹配"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">加载中...</div>
      ) : jobList.length === 0 ? (
        <div className="text-center py-20">
          <Radar size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无推荐岗位</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobList.map((job, i) => (
            <motion.div key={job.id ?? i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl glass-card p-5 hover:border-emerald-500/20 transition-all">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 text-center">
                  <div className={`text-xl font-bold ${job.match >= 90 ? "text-emerald-400" : job.match >= 80 ? "text-blue-400" : "text-amber-400"}`}>{job.match}</div>
                  <div className="text-[10px] text-slate-500">匹配</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{job.title}</h3>
                    {job.isNew && <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-emerald-500/20">NEW</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Building2 size={11} />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>
                    <span className="flex items-center gap-1 text-amber-400"><DollarSign size={11} />{job.salary}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{job.postedAt}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-1">{job.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(job.tags ?? []).map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300 border border-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors">
                    <Bookmark size={14} />
                  </button>
                  <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs px-3">
                    投递<ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
