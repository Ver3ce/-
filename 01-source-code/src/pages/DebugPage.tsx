import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Database, Users, Settings, RefreshCw, Play, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function DebugPage() {
  const [initResult, setInitResult] = useState<any>(null);
  
  const { data: health, isLoading, refetch } = trpc.debug.health.useQuery();
  const initDb = trpc.debug.initDatabase.useMutation({
    onSuccess: (data) => setInitResult(data)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">🔧 系统诊断工具</h1>
          <p className="text-slate-400">检查数据库连接和系统状态</p>
        </motion.div>

        {/* 刷新按钮 */}
        <div className="flex justify-end">
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="border-white/10 text-slate-300"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            刷新状态
          </Button>
        </div>

        {/* 数据库状态 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="rounded-2xl glass-card p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} className={health?.database?.ok ? 'text-emerald-400' : 'text-red-400'} />
            <h2 className="text-xl font-semibold text-white">数据库连接</h2>
          </div>
          
          {isLoading ? (
            <p className="text-slate-400">检查中...</p>
          ) : health?.database ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {health.database.ok ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="text-red-400" />
                )}
                <span className={health.database.ok ? 'text-emerald-400' : 'text-red-400'}>
                  {health.database.ok ? '连接正常' : '连接失败'}
                </span>
              </div>
              <p className="text-sm text-slate-400">{health.database.message}</p>
            </div>
          ) : (
            <p className="text-slate-400">无法获取状态</p>
          )}
        </motion.div>

        {/* 数据表状态 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl glass-card p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Activity size={24} className="text-blue-400" />
            <h2 className="text-xl font-semibold text-white">数据表状态</h2>
          </div>
          
          {health?.tables && !health.tables.error ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-400" />
                  <span className="text-slate-300">用户表</span>
                </div>
                <p className="text-2xl font-bold text-white">{health.tables.users?.count || 0}</p>
                <p className="text-xs text-slate-500">条记录</p>
              </div>
              
              <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Settings size={16} className="text-amber-400" />
                  <span className="text-slate-300">系统设置</span>
                </div>
                <p className="text-2xl font-bold text-white">{health.tables.systemSettings?.count || 0}</p>
                <p className="text-xs text-slate-500">条记录</p>
              </div>
            </div>
          ) : health?.tables?.error ? (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-red-400">{health.tables.error}</p>
              <p className="text-sm text-slate-500 mt-2">
                数据表可能不存在，请执行数据库初始化
              </p>
            </div>
          ) : (
            <p className="text-slate-400">无法获取状态</p>
          )}
        </motion.div>

        {/* 初始化按钮 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl glass-card p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">数据库初始化</h2>
          <p className="text-slate-400 text-sm mb-4">
            如果数据库表为空，点击下面的按钮插入测试数据（管理员账号、测试用户、默认设置）
          </p>
          
          <Button 
            onClick={() => initDb.mutate()}
            disabled={initDb.isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {initDb.isPending ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                初始化中...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                初始化数据库
              </>
            )}
          </Button>

          {initResult && (
            <div className={`mt-4 rounded-lg p-4 border ${initResult.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <div className="flex items-center gap-2">
                {initResult.success ? (
                  <CheckCircle size={16} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={16} className="text-amber-400" />
                )}
                <span className={initResult.success ? 'text-emerald-400' : 'text-amber-400'}>
                  {initResult.message}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* 环境信息 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl glass-card p-6 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-white mb-4">环境信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">DATABASE_URL 配置:</span>
              <span className={health?.env?.databaseUrlConfigured ? 'text-emerald-400' : 'text-red-400'}>
                {health?.env?.databaseUrlConfigured ? '已配置' : '未配置'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">APP_ID:</span>
              <span className="text-slate-300">{health?.env?.appId || '未设置'}</span>
            </div>
          </div>
        </motion.div>

        {/* 返回链接 */}
        <div className="text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
