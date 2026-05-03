import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, resumes, interviewSessions, orders } from "@db/schema";
import { desc, sql, count, eq } from "drizzle-orm";

export const adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ count: count() }).from(users);
    const [resumeCount] = await db.select({ count: count() }).from(resumes);
    const [interviewCount] = await db.select({ count: count() }).from(interviewSessions);
    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [paidAmount] = await db
      .select({ total: sql<string>`COALESCE(SUM(${orders.amount}), 0)` })
      .from(orders)
      .where(eq(orders.status, "paid"));
    return {
      users: userCount.count,
      resumes: resumeCount.count,
      interviews: interviewCount.count,
      orders: orderCount.count,
      revenue: paidAmount.total,
    };
  }),

  // List all users
  listUsers: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      return db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset);
    }),

  // List all resumes
  listResumes: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      return db
        .select()
        .from(resumes)
        .orderBy(desc(resumes.createdAt))
        .limit(pageSize)
        .offset(offset);
    }),

  // List all orders
  listOrders: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      return db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(pageSize)
        .offset(offset);
    }),

  // List all interview sessions
  listInterviews: adminQuery
    .input(
      z.object({
        page: z.number().default(1),
        pageSize: z.number().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page ?? 1;
      const pageSize = input?.pageSize ?? 20;
      const offset = (page - 1) * pageSize;
      return db
        .select()
        .from(interviewSessions)
        .orderBy(desc(interviewSessions.createdAt))
        .limit(pageSize)
        .offset(offset);
    }),

  // Update user role
  updateUserRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),
});
