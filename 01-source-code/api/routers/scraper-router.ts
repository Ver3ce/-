import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import { scrapeBossZhipin, scrapeLiepin, saveScrapedJobs, getJobsFromDatabase, runBatchScrape } from "../services/job-scraper";

export const scraperRouter = createRouter({
  // Admin: Trigger scrape for a keyword
  scrape: adminQuery
    .input(
      z.object({
        keyword: z.string().min(1),
        source: z.enum(["boss", "liepin"]).default("boss"),
      })
    )
    .mutation(async ({ input }) => {
      let jobs;
      if (input.source === "liepin") {
        jobs = await scrapeLiepin(input.keyword);
      } else {
        jobs = await scrapeBossZhipin(input.keyword);
      }
      const saved = await saveScrapedJobs(jobs);
      return { scraped: jobs.length, saved };
    }),

  // Admin: Run batch scrape
  batchScrape: adminQuery.mutation(async () => {
    const total = await runBatchScrape();
    return { total };
  }),

  // Public: Get scraped jobs
  getJobs: authedQuery
    .input(
      z.object({
        keyword: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const jobs = await getJobsFromDatabase(input.keyword, input.limit);
      return jobs;
    }),

  // Admin: Get scrape status
  status: adminQuery.query(async () => {
    // Return basic status
    return { active: true };
  }),
});
