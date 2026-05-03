/**
 * 招聘网站爬虫服务
 * 
 * 目前支持的招聘平台：
 * 1. Boss 直聘（https://www.zhipin.com）- 中国最大的招聘平台
 * 2. 猎聘（https://www.liepin.com）
 * 
 * 注意：爬虫仅供学习研究使用，请遵守各平台的 robots.txt 和使用条款。
 * 生产环境建议使用官方 API。
 */

import { chromium, type Browser } from "playwright";
import { getDb } from "../queries/connection";
import { jobSources } from "@db/schema";
import { eq, gte } from "drizzle-orm";

export interface ScrapedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  description: string;
  requirements: string[];
  education: string;
  experience: string;
  companySize: string;
  companyStage: string;
  source: string;
  url: string;
  postedAt: string;
}

/**
 * 爬取 Boss 直聘职位
 * 注意：Boss 直聘有反爬虫机制，需要处理验证码
 */
export async function scrapeBossZhipin(keyword: string, city: string = ""): Promise<ScrapedJob[]> {
  let browser: Browser | null = null;
  const jobs: ScrapedJob[] = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });

    const page = await context.newPage();

    // 构造搜索 URL
    const cityCode = getCityCode(city);
    const searchUrl = `https://www.zhipin.com/web/geek/job?query=${encodeURIComponent(keyword)}&city=${cityCode}`;

    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });

    // 等待职位列表加载
    await page.waitForSelector(".job-card-wrapper", { timeout: 10000 }).catch(() => {
      console.log("[Scraper] 未找到职位列表，可能遇到反爬虫");
    });

    // 提取职位信息
    const jobCards = await page.locator(".job-card-wrapper").all();

    for (const card of jobCards.slice(0, 20)) {
      try {
        const title = await card.locator(".job-name").textContent().catch(() => "");
        const company = await card.locator(".company-name").textContent().catch(() => "");
        const locationText = await card.locator(".job-area").textContent().catch(() => "");
        const salaryText = await card.locator(".salary").textContent().catch(() => "");
        const tags = await card.locator(".tag-list li").allTextContents().catch(() => []);
        const url = await card.locator("a").getAttribute("href").catch(() => "");

        if (title && company) {
          jobs.push({
            externalId: `boss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title: title.trim(),
            company: company.trim(),
            location: (locationText ?? "").trim(),
            salary: (salaryText ?? "").trim(),
            tags: tags.map(t => t.trim()).filter(Boolean),
            description: "",
            requirements: [],
            education: "",
            experience: "",
            companySize: "",
            companyStage: "",
            source: "boss",
            url: (url ?? "").startsWith("http") ? (url ?? "") : `https://www.zhipin.com${url ?? ""}`,
            postedAt: "",
          });
        }
      } catch (e) {
        console.log("[Scraper] 解析卡片失败:", e);
      }
    }

    await browser.close();
  } catch (error) {
    console.error("[Scraper] Boss 直聘爬取失败:", error);
    if (browser) await browser.close();
  }

  return jobs;
}

/**
 * 爬取猎聘职位
 */
export async function scrapeLiepin(_keyword: string, _city: string = ""): Promise<ScrapedJob[]> {
  let browser: Browser | null = null;
  const jobs: ScrapedJob[] = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    });

    const page = await context.newPage();
    const searchUrl = `https://www.liepin.com/zhaopin/?key=${encodeURIComponent(_keyword)}`;

    await page.goto(searchUrl, { waitUntil: "networkidle", timeout: 30000 });

    const cards = await page.locator(".job-card-pc").all();

    for (const card of cards.slice(0, 15)) {
      try {
        const title = await card.locator(".job-title-box .ellipsis-1").textContent().catch(() => "");
        const company = await card.locator(".company-name").textContent().catch(() => "");
        const locationText = await card.locator(".job-labels-box .labels-tag").first().textContent().catch(() => "");
        const salaryText = await card.locator(".job-salary").textContent().catch(() => "");

        if (title && company) {
          jobs.push({
            externalId: `liepin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title: title.trim(),
            company: company.trim(),
            location: (locationText ?? "").trim(),
            salary: (salaryText ?? "").trim(),
            tags: [],
            description: "",
            requirements: [],
            education: "",
            experience: "",
            companySize: "",
            companyStage: "",
            source: "liepin",
            url: "",
            postedAt: "",
          });
        }
      } catch {
        // Skip failed cards
      }
    }

    await browser.close();
  } catch (error) {
    console.error("[Scraper] 猎聘爬取失败:", error);
    if (browser) await browser.close();
  }

  return jobs;
}

/**
 * 保存爬取的数据到数据库
 */
export async function saveScrapedJobs(jobs: ScrapedJob[]) {
  const db = getDb();

  for (const job of jobs) {
    // Check if already exists
    const existing = await db
      .select()
      .from(jobSources)
      .where(eq(jobSources.externalId, job.externalId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(jobSources).values({
        externalId: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        tags: job.tags,
        description: job.description,
        requirements: job.requirements,
        education: job.education,
        experience: job.experience,
        companySize: job.companySize,
        companyStage: job.companyStage,
        source: job.source,
        url: job.url,
      });
    }
  }

  return jobs.length;
}

/**
 * 获取数据库中的职位（用于推荐）
 */
export async function getJobsFromDatabase(_keyword?: string, limit: number = 50) {
  const db = getDb();

  // 获取最近24小时内爬取的职位
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rows = await db
    .select()
    .from(jobSources)
    .where(gte(jobSources.createdAt, oneDayAgo))
    .limit(limit);

  return rows.map(row => ({
    id: row.id,
    externalId: row.externalId,
    title: row.title,
    company: row.company,
    location: row.location,
    salary: row.salary,
    tags: row.tags as string[],
    description: row.description,
    requirements: row.requirements as string[],
    education: row.education,
    experience: row.experience,
    companySize: row.companySize,
    companyStage: row.companyStage,
    source: row.source,
    url: row.url,
    postedAt: "",
    isNew: true,
  }));
}

/**
 * 执行批量爬取任务
 */
export async function runBatchScrape() {
  const keywords = ["前端工程师", "后端工程师", "产品经理", "数据分析师", "UI设计师"];
  let totalSaved = 0;

  for (const keyword of keywords) {
    console.log(`[Scraper] 开始爬取: ${keyword}`);
    try {
      const jobs = await scrapeBossZhipin(keyword);
      if (jobs.length > 0) {
        const saved = await saveScrapedJobs(jobs);
        totalSaved += saved;
        console.log(`[Scraper] ${keyword}: 保存 ${saved} 条`);
      } else {
        console.log(`[Scraper] ${keyword}: 未获取到数据`);
      }
    } catch (e) {
      console.error(`[Scraper] ${keyword} 失败:`, e);
    }

    // 避免请求过快
    await new Promise(r => setTimeout(r, 3000));
  }

  return totalSaved;
}

// 城市代码映射
function getCityCode(_city: string): string {
  const map: Record<string, string> = {
    "北京": "101010100",
    "上海": "101020100",
    "广州": "101280100",
    "深圳": "101280600",
    "杭州": "101210100",
    "成都": "101270100",
    "武汉": "101200100",
    "西安": "101110100",
    "南京": "101190100",
    "苏州": "101190400",
  };
  return map[_city] || "101010100";
}