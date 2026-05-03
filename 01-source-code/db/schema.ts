import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  json,
  boolean,
  decimal,
  int,
} from "drizzle-orm/mysql-core";

// ===== Users =====
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  username: varchar("username", { length: 100 }).unique(),
  password: varchar("password", { length: 255 }),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).unique(),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== User Profiles (for personalized recommendations) =====
export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  targetRole: varchar("target_role", { length: 200 }),
  targetIndustry: varchar("target_industry", { length: 200 }),
  targetLocation: varchar("target_location", { length: 200 }),
  expectedSalary: varchar("expected_salary", { length: 100 }),
  skills: json("skills"),
  experience: varchar("experience", { length: 50 }),
  education: varchar("education", { length: 100 }),
  preferences: json("preferences"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;

// ===== System Settings (admin-only) =====
export const systemSettings = mysqlTable("system_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key_name", { length: 200 }).notNull().unique(),
  value: text("value"),
  description: varchar("description", { length: 500 }),
  updatedBy: bigint("updatedBy", { mode: "number", unsigned: true }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type SystemSetting = typeof systemSettings.$inferSelect;

// ===== Resumes =====
export const resumes = mysqlTable("resumes", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  filename: varchar("filename", { length: 255 }),
  content: text("content"),
  parsedData: json("parsedData"),
  score: json("score"),
  optimizedContent: text("optimizedContent"),
  status: mysqlEnum("status", ["pending", "analyzed", "optimized"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Resume = typeof resumes.$inferSelect;

// ===== Interview Sessions =====
export const interviewSessions = mysqlTable("interview_sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }),
  jobType: varchar("jobType", { length: 100 }),
  status: mysqlEnum("status", ["active", "completed"]).default("active"),
  score: json("score"),
  messages: json("messages"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type InterviewSession = typeof interviewSessions.$inferSelect;

// ===== AI Personas =====
export const aiPersonas = mysqlTable("ai_personas", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt").notNull(),
  icon: varchar("icon", { length: 50 }).default("bot"),
  category: mysqlEnum("category", ["resume", "interview", "career", "skill", "custom"]).default("custom"),
  isDefault: boolean("isDefault").default(false),
  isCustom: boolean("isCustom").default(false),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiPersona = typeof aiPersonas.$inferSelect;

// ===== Products/Services =====
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }),
  type: mysqlEnum("type", ["resume", "interview", "combo", "vip"]).notNull(),
  features: json("features"),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ===== Orders =====
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  orderNo: varchar("orderNo", { length: 64 }).notNull().unique(),
  productId: bigint("productId", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending"),
  payType: mysqlEnum("payType", ["wechat", "alipay"]),
  payTime: timestamp("payTime"),
  thirdPartyOrderNo: varchar("thirdPartyOrderNo", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Order = typeof orders.$inferSelect;

// ===== Job Sources (scraped from real platforms) =====
export const jobSources = mysqlTable("job_sources", {
  id: serial("id").primaryKey(),
  externalId: varchar("externalId", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 200 }),
  company: varchar("company", { length: 200 }),
  location: varchar("location", { length: 200 }),
  salary: varchar("salary", { length: 100 }),
  tags: json("tags"),
  description: text("description"),
  requirements: json("requirements"),
  education: varchar("education", { length: 100 }),
  experience: varchar("experience", { length: 100 }),
  companySize: varchar("companySize", { length: 100 }),
  companyStage: varchar("companyStage", { length: 100 }),
  source: varchar("source", { length: 50 }).notNull(),
  url: text("url"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JobSource = typeof jobSources.$inferSelect;

// ===== Saved Jobs =====
export const savedJobs = mysqlTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  externalId: varchar("externalId", { length: 255 }),
  jobData: json("jobData").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedJob = typeof savedJobs.$inferSelect;
