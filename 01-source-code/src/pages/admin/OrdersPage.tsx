import { motion } from "framer-motion";
import { ShoppingBag, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/providers/trpc";

export default function AdminOrders() {
  const { data: orderList } = trpc.admin.listOrders.useQuery({});
  const orders = (orderList ?? []) as any[];

  const statusCfg: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "待支付", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
    paid: { label: "已支付", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
    failed: { label: "失败", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
    refunded: { label: "已退款", color: "text-slate-400 bg-slate-500/10 border-slate-500/20", icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">订单管理</h1>
          <p className="text-slate-400 text-sm">管理所有用户订单</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <ShoppingBag size={16} />
          <span>共 {orders.length} 笔订单</span>
        </div>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/5">
            <th className="text-left px-4 py-3 text-slate-400 font-medium">订单号</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">用户ID</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">金额</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">状态</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">支付方式</th>
            <th className="text-left px-4 py-3 text-slate-400 font-medium">时间</th>
          </tr></thead>
          <tbody>{orders.map((o, i) => {
            const cfg = statusCfg[o.status] ?? statusCfg.pending;
            const Icon = cfg.icon;
            return (
              <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white font-mono text-xs">{o.orderNo}</td>
                <td className="px-4 py-3 text-slate-400">{o.userId}</td>
                <td className="px-4 py-3 text-white font-medium">¥{o.amount}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`text-[10px] ${cfg.color}`}><Icon size={10} className="mr-1" />{cfg.label}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{o.payType === "wechat" ? "微信支付" : o.payType === "alipay" ? "支付宝" : "-"}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleString()}</td>
              </motion.tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
