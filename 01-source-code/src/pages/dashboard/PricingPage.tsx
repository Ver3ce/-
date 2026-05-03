import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

const TYPE_CONFIG: Record<string, { color: string; gradient: string; icon: any }> = {
  resume: { color: "blue", gradient: "from-blue-500 to-blue-600", icon: Check },
  interview: { color: "purple", gradient: "from-purple-500 to-purple-600", icon: Sparkles },
  combo: { color: "emerald", gradient: "from-emerald-500 to-emerald-600", icon: Zap },
  vip: { color: "amber", gradient: "from-amber-500 to-orange-500", icon: Crown },
};

export default function PricingPage() {
  const { data: products } = trpc.payment.listProducts.useQuery();
  const createOrder = trpc.payment.createOrder.useMutation();
  const productList = (products ?? []) as any[];

  return (
    <div className="max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">服务套餐</h1>
        <p className="text-slate-400 text-sm">选择适合你的求职服务</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {productList.map((p, i) => {
          const cfg = TYPE_CONFIG[p.type] ?? TYPE_CONFIG.resume;
          const features = (p.features as string[]) ?? [];
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`rounded-2xl glass-card p-6 ${p.type === "vip" ? "border-amber-500/30" : ""} flex flex-col`}>
              {p.type === "vip" && <Badge className="mb-3 bg-amber-500/10 text-amber-400 border-amber-500/20 self-start"><Star size={10} className="mr-1" />推荐</Badge>}
              <h3 className="font-semibold text-white mb-1">{p.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{p.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">¥{p.price}</span>
                {p.originalPrice && <span className="text-sm text-slate-500 line-through ml-2">¥{p.originalPrice}</span>}
              </div>
              <div className="space-y-2 mb-6 flex-1">
                {features.map((f: string, j: number) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check size={12} className={`text-${cfg.color}-400 flex-shrink-0`} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => createOrder.mutate({ productId: p.id, payType: "wechat" })}
                disabled={createOrder.isPending}
                className={`w-full bg-gradient-to-r ${cfg.gradient} text-white rounded-xl ${p.type === "vip" ? "py-5" : ""}`}>
                {createOrder.isPending ? "处理中..." : "立即购买"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="rounded-2xl glass-card p-6 border border-amber-500/10">
        <div className="flex items-center gap-3 mb-4">
          <Crown size={20} className="text-amber-400" />
          <h3 className="font-semibold text-white">支付说明</h3>
        </div>
        <p className="text-sm text-slate-400 mb-3">目前支持微信支付和支付宝两种支付方式。</p>
        <p className="text-xs text-slate-500">支付功能需要配置商户号后才能使用。管理员请在「系统设置」中完成配置。</p>
      </div>
    </div>
  );
}
