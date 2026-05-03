import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { orders, products } from "@db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * 支付路由 - 预留接口
 * 
 * 微信支付接入需要：
 * 1. 企业/个体户营业执照
 * 2. 微信支付商户号（https://pay.weixin.qq.com/）
 * 3. 商户API证书和密钥
 * 4. 配置回调URL（需要备案域名）
 * 
 * 支付宝接入需要：
 * 1. 企业/个体户营业执照
 * 2. 支付宝商家中心账号（https://b.alipay.com/）
 * 3. 应用APPID
 * 4. 私钥和公钥
 * 5. 配置回调URL（需要备案域名）
 * 
 * TODO: 请在下方插入你的商户配置
 */

// ===== 商户配置预留区 =====
// const WECHAT_CONFIG = {
//   mchId: '你的商户号',
//   appId: '你的APPID',
//   apiKey: '你的API密钥',
//   notifyUrl: 'https://你的域名/api/payment/wechat-callback',
// };

// const ALIPAY_CONFIG = {
//   appId: '你的应用ID',
//   privateKey: '你的应用私钥',
//   alipayPublicKey: '支付宝公钥',
//   notifyUrl: 'https://你的域名/api/payment/alipay-callback',
// };

// Generate unique order number
function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `AO${dateStr}${randomStr}`;
}

export const paymentRouter = createRouter({
  // List available products
  listProducts: authedQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.sortOrder);
  }),

  // Create order (generate order, return pay params)
  createOrder: authedQuery
    .input(
      z.object({
        productId: z.number(),
        payType: z.enum(["wechat", "alipay"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Get product info
      const productRows = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId));
      const product = productRows[0];
      if (!product) throw new Error("Product not found");

      // Create order
      const orderNo = generateOrderNo();
      const [result] = await db.insert(orders).values({
        userId: ctx.user.id,
        orderNo,
        productId: input.productId,
        amount: product.price,
        status: "pending",
        payType: input.payType,
      }).$returningId();

      // ===== TODO: 接入真实支付 =====
      // 微信支付：调用统一下单API，返回 prepay_id
      // 支付宝：调用 trade.precreate，返回支付二维码URL
      
      // Mock: Return order info for now
      return {
        orderId: result.id,
        orderNo,
        amount: product.price,
        productName: product.name,
        payType: input.payType,
        // TODO: 接入真实支付后返回以下参数
        // wechat: { prepayId, appId, nonceStr, timeStamp, sign }
        // alipay: { qrCodeUrl, tradeNo }
        mockPayUrl: `/api/payment/mock-pay?orderNo=${orderNo}&type=${input.payType}`,
      };
    }),

  // Query order status
  queryOrder: authedQuery
    .input(z.object({ orderNo: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNo, input.orderNo));
      return rows[0] ?? null;
    }),

  // Get user orders
  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id))
      .orderBy(desc(orders.createdAt));
  }),

  // ===== 微信支付回调（TODO: 需要配置URL） =====
  // wechatCallback: publicProcedure
  //   .input(z.any())
  //   .mutation(async ({ input }) => {
  //     // 1. 验证签名
  //     // 2. 更新订单状态
  //     // 3. 开通对应服务
  //   }),

  // ===== 支付宝回调（TODO: 需要配置URL） =====
  // alipayCallback: publicProcedure
  //   .input(z.any())
  //   .mutation(async ({ input }) => {
  //     // 1. 验证签名
  //     // 2. 更新订单状态
  //     // 3. 开通对应服务
  //   }),
});
