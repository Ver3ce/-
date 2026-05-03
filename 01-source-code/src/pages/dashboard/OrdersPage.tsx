import { motion } from "framer-motion";
import { Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

export default function OrdersPage() {
  const { data: orders } = trpc.payment.myOrders.useQuery();
  const orderList = (orders ?? []) as any[];

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "待支付", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
    paid: { label: "已支付", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    failed: { label: "失败", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
    refunded: { label: "已退款", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: XCircle },
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">我的订单</h1>
        <p className="text-slate-400 text-sm">查看你的服务订单和支付状态</p>
      </div>

      {orderList.length === 0 ? (
        <div className="rounded-2xl glass-card p-12 text-center">
          <Sparkles size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">暂无订单</p>
          <p className="text-xs text-slate-500 mt-1">前往「服务套餐」页面购买服务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderList.map((o, i) => {
            const cfg = statusConfig[o.status] ?? statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl glass-card p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm">{o.orderNo}</span>
                    <Badge variant="outline" className={`text-[10px] ${cfg.color}`}><Icon size={10} className="mr-1" />{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">¥{o.amount}</span>
                  <p className="text-[10px] text-slate-500">{o.payType === "wechat" ? "微信支付" : o.payType === "alipay" ? "支付宝" : ""}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
