import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Save, CheckCircle2, AlertTriangle, ExternalLink, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function AdminApiSettings() {
  const [apiKey, setApiKey] = useState("");
  const [wechatMchId, setWechatMchId] = useState("");
  const [wechatAppId, setWechatAppId] = useState("");
  const [alipayAppId, setAlipayAppId] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: settingsList, isLoading: isLoadingSettings } = trpc.system.list.useQuery();
  const setSetting = trpc.system.set.useMutation({
    onError: (err) => {
      setSaveError(err.message || "保存失败，请检查网络连接或权限");
    }
  });

  // Load existing settings
  useEffect(() => {
    if (settingsList) {
      settingsList.forEach(s => {
        if (s.key === "kimi_api_key") setApiKey(s.value ?? "");
        if (s.key === "wechat_mch_id") setWechatMchId(s.value ?? "");
        if (s.key === "wechat_app_id") setWechatAppId(s.value ?? "");
        if (s.key === "alipay_app_id") setAlipayAppId(s.value ?? "");
      });
    }
  }, [settingsList]);

  const handleSave = async () => {
    setSaveError(null);
    try {
      const promises = [];
      
      if (apiKey.trim()) {
        promises.push(setSetting.mutateAsync({ 
          key: "kimi_api_key", 
          value: apiKey.trim(), 
          description: "Kimi AI API Key（所有用户共享）" 
        }));
      }
      if (wechatMchId.trim()) {
        promises.push(setSetting.mutateAsync({ 
          key: "wechat_mch_id", 
          value: wechatMchId.trim(), 
          description: "微信支付商户号" 
        }));
      }
      if (wechatAppId.trim()) {
        promises.push(setSetting.mutateAsync({ 
          key: "wechat_app_id", 
          value: wechatAppId.trim(), 
          description: "微信支付APPID" 
        }));
      }
      if (alipayAppId.trim()) {
        promises.push(setSetting.mutateAsync({ 
          key: "alipay_app_id", 
          value: alipayAppId.trim(), 
          description: "支付宝应用ID" 
        }));
      }
      
      await Promise.all(promises);
      alert("保存成功！");
    } catch (error: any) {
      console.error("保存失败:", error);
      setSaveError(error?.message || "保存失败，请检查网络连接或权限");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-amber-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">系统设置</h1>
          <p className="text-slate-400 text-sm">仅管理员可访问 - 配置全局服务参数</p>
        </div>
      </div>

      {/* Kimi API Key */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass-card p-6 space-y-4 border border-blue-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Key size={20} /></div>
          <div>
            <h3 className="font-semibold text-white">Kimi AI API Key</h3>
            <p className="text-xs text-slate-400">配置后所有用户均可使用AI功能，无需各自配置</p>
          </div>
        </div>

        {apiKey ? (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-sm text-emerald-400">API Key 已配置</span>
          </div>
        ) : (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-sm text-amber-400">尚未配置 API Key，AI 使用模拟模式运行</span>
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 mb-1 block">API Key</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.open("https://platform.moonshot.cn/", "_blank")}
            variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/5">
            <ExternalLink size={14} className="mr-1" />获取 Key
          </Button>
        </div>
      </motion.div>

      {/* Payment Settings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="rounded-2xl glass-card p-6 space-y-4 border border-emerald-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">微信支付配置</h3>
            <p className="text-xs text-slate-400">需要微信支付商户号（https://pay.weixin.qq.com/）</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">商户号 (mch_id)</label>
            <input value={wechatMchId} onChange={e => setWechatMchId(e.target.value)} placeholder="1234567890"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">APPID</label>
            <input value={wechatAppId} onChange={e => setWechatAppId(e.target.value)} placeholder="wx1234567890"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50" />
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <p className="text-xs text-slate-500">商户API证书和密钥请存储在安全位置，不要直接暴露在代码中。</p>
          <p className="text-xs text-amber-400/70 mt-1">回调URL: https://你的域名/api/payment/wechat-callback</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="rounded-2xl glass-card p-6 space-y-4 border border-blue-500/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
          </div>
          <div>
            <h3 className="font-semibold text-white">支付宝配置</h3>
            <p className="text-xs text-slate-400">需要支付宝商家中心账号（https://b.alipay.com/）</p>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">应用ID (APPID)</label>
          <input value={alipayAppId} onChange={e => setAlipayAppId(e.target.value)} placeholder="2024XXXXXXXXXXXX"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50" />
        </div>

        <div className="rounded-lg bg-white/[0.02] border border-white/5 p-3">
          <p className="text-xs text-slate-500">应用私钥和支付宝公钥请存储在安全位置。</p>
          <p className="text-xs text-blue-400/70 mt-1">回调URL: https://你的域名/api/payment/alipay-callback</p>
        </div>
      </motion.div>

      {/* Error Message */}
      {saveError && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 flex items-start gap-3"
        >
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-400 font-medium">保存失败</p>
            <p className="text-xs text-red-400/70 mt-1">{saveError}</p>
            <p className="text-xs text-slate-500 mt-2">请检查：1) 网络连接 2) 是否以管理员身份登录 3) 数据库是否正常运行</p>
          </div>
        </motion.div>
      )}

      <Button 
        onClick={handleSave} 
        disabled={setSetting.isPending || isLoadingSettings}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {setSetting.isPending ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />保存中...
          </>
        ) : (
          <>
            <Save size={16} className="mr-2" />保存所有设置
          </>
        )}
      </Button>
    </div>
  );
}
