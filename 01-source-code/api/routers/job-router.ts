import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { savedJobs, userProfiles } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { getJobsFromDatabase } from "../services/job-scraper";

// Calculate match score based on user profile
function calculateMatchScore(job: any, profile: any): number {
  let score = 60;

  if (!profile) return Math.floor(Math.random() * 20) + 70;

  // Skill matching
  if (profile.skills) {
    const userSkills: string[] = Array.isArray(profile.skills)
      ? profile.skills
      : (typeof profile.skills === "string" ? JSON.parse(profile.skills) : []);
    const jobTags: string[] = (job.tags ?? []).map((t: string) => t.toLowerCase());
    const matchedSkills = jobTags.filter((tag: string) =>
      userSkills.some((skill: string) => skill.toLowerCase().includes(tag) || tag.includes(skill.toLowerCase()))
    );
    score += (matchedSkills.length / Math.max(jobTags.length, 1)) * 25;
  }

  // Location matching
  if (profile.targetLocation && job.location) {
    if (job.location.includes(profile.targetLocation)) score += 8;
  }

  // Role matching
  if (profile.targetRole && job.title) {
    const targetRole = profile.targetRole.toLowerCase();
    const title = job.title.toLowerCase();
    if (title.includes(targetRole) || targetRole.split(/[\/\s]/).some((r: string) => title.includes(r))) {
      score += 7;
    }
  }

  return Math.min(Math.floor(score), 98);
}

export const jobRouter = createRouter({
  // Fetch jobs with personalization (from scraped database or fallback)
  list: authedQuery
    .input(
      z.object({
        query: z.string().optional(),
        location: z.string().optional(),
        filter: z.enum(["all", "high-match"]).default("all"),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Get user profile for personalization
      const profileRows = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, ctx.user.id));
      const profile = profileRows[0];

      // Get jobs from database (scraped real data)
      const jobRows = await getJobsFromDatabase(input?.query, input?.filter === "high-match" ? 30 : 50);

      // If no scraped data, fall back to mock data
      let allJobs: any[] = jobRows.length > 0 ? jobRows : getMockJobs();

      // Add match scores
      allJobs = allJobs.map((job: any) => ({
        ...job,
        match: calculateMatchScore(job, profile),
      }));

      // Sort by match score
      allJobs.sort((a: any, b: any) => b.match - a.match);

      // Filter
      if (input?.filter === "high-match") {
        allJobs = allJobs.filter((j: any) => j.match >= 85);
      }

      return allJobs;
    }),

  // Save job
  save: authedQuery
    .input(z.object({ jobData: z.record(z.string(), z.any()) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(savedJobs).values({
        userId: ctx.user.id,
        externalId: input.jobData.id as string,
        jobData: input.jobData,
      });
      return { success: true };
    }),

  // Get saved jobs
  getSaved: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(savedJobs)
      .where(eq(savedJobs.userId, ctx.user.id))
      .orderBy(desc(savedJobs.createdAt));
  }),

  // Delete saved job
  unsave: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(savedJobs).where(eq(savedJobs.id, input.id));
      return { success: true };
    }),

  // Update user profile for better recommendations
  updateProfile: authedQuery
    .input(
      z.object({
        targetRole: z.string().optional(),
        targetIndustry: z.string().optional(),
        targetLocation: z.string().optional(),
        expectedSalary: z.string().optional(),
        skills: z.array(z.string()).optional(),
        experience: z.string().optional(),
        education: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db
        .insert(userProfiles)
        .values({
          userId: ctx.user.id,
          ...input,
          skills: input.skills ? JSON.stringify(input.skills) : undefined,
        })
        .onDuplicateKeyUpdate({
          set: { ...input, skills: input.skills ? JSON.stringify(input.skills) : undefined, updatedAt: new Date() },
        });
      return { success: true };
    }),

  // Get user profile
  getProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, ctx.user.id));
    return rows[0] ?? null;
  }),
});

// Mock jobs fallback
function getMockJobs() {
  return [
    { id: "job_001", title: "高级前端工程师", company: "字节跳动", location: "北京·海淀区", salary: "35-55K·16薪", tags: ["React", "TypeScript", "微前端"], postedAt: "2小时前", description: "负责抖音电商业务的前端架构设计和开发", requirements: ["5年以上前端经验", "精通React生态", "有大型项目架构经验"], education: "本科及以上", experience: "5-10年", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/001", source: "mock", isNew: true },
    { id: "job_002", title: "前端架构师", company: "蚂蚁集团", location: "杭州·西湖区", salary: "40-65K·16薪", tags: ["Node.js", "性能优化", "团队管理"], postedAt: "5小时前", description: "负责支付宝前端技术架构升级", requirements: ["7年以上前端经验", "精通前端工程化", "有团队管理经验"], education: "本科及以上", experience: "7年以上", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/002", source: "mock", isNew: true },
    { id: "job_003", title: "技术负责人（前端）", company: "美团", location: "北京·朝阳区", salary: "45-70K·15薪", tags: ["React", "工程化", "架构设计"], postedAt: "1天前", description: "带领前端团队完成核心业务的架构升级", requirements: ["8年以上开发经验", "精通前端架构", "优秀的领导力"], education: "本科及以上", experience: "8年以上", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/003", source: "mock", isNew: false },
    { id: "job_004", title: "资深前端开发工程师", company: "腾讯", location: "深圳·南山区", salary: "30-50K·16薪", tags: ["Vue", "微信小程序", "全栈"], postedAt: "1天前", description: "参与微信小程序生态的前端技术建设", requirements: ["4年以上前端经验", "熟悉Vue或React", "有小程序开发经验"], education: "本科及以上", experience: "3-5年", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/004", source: "mock", isNew: false },
    { id: "job_005", title: "前端技术专家", company: "阿里巴巴", location: "杭州·余杭区", salary: "40-60K·16薪", tags: ["React", "低代码", "工程化"], postedAt: "2天前", description: "负责淘宝前端工程化体系和低代码平台建设", requirements: ["6年以上前端经验", "有工程化建设经验", "熟悉低代码领域"], education: "本科及以上", experience: "5-10年", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/005", source: "mock", isNew: false },
    { id: "job_006", title: "全栈工程师", company: "小红书", location: "上海·黄浦区", salary: "28-45K·15薪", tags: ["React", "Node.js", "Go"], postedAt: "3天前", description: "负责小红书社区功能的全栈开发和性能优化", requirements: ["3年以上全栈经验", "熟悉React和Node.js", "有性能优化经验"], education: "本科及以上", experience: "3-5年", companySize: "1000-9999人", companyStage: "已上市", url: "https://job.example.com/006", source: "mock", isNew: false },
    { id: "job_007", title: "React Native 开发工程师", company: "滴滴出行", location: "北京·海淀区", salary: "25-40K·15薪", tags: ["React Native", "移动端", "跨平台"], postedAt: "4小时前", description: "负责滴滴出行App的跨端功能开发", requirements: ["3年以上RN经验", "熟悉iOS/Android原生", "有大型App经验"], education: "本科及以上", experience: "3-5年", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/007", source: "mock", isNew: true },
    { id: "job_008", title: "前端性能优化专家", company: "京东", location: "北京·大兴区", salary: "35-50K·14薪", tags: ["性能优化", "Webpack", "工程化"], postedAt: "6小时前", description: "负责京东商城前端性能优化", requirements: ["5年以上前端经验", "精通性能优化", "有电商项目经验"], education: "本科及以上", experience: "5-10年", companySize: "10000人以上", companyStage: "已上市", url: "https://job.example.com/008", source: "mock", isNew: true },
  ];
}
