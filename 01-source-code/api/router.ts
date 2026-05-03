import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { resumeRouter } from "./routers/resume-router";
import { interviewRouter } from "./routers/interview-router";
import { personaRouter } from "./routers/persona-router";
import { settingsRouter } from "./routers/settings-router";
import { jobRouter } from "./routers/job-router";
import { skillRouter } from "./routers/skill-router";
import { systemSettingsRouter } from "./routers/system-settings-router";
import { adminRouter } from "./routers/admin-router";
import { paymentRouter } from "./routers/payment-router";
import { scraperRouter } from "./routers/scraper-router";
import { debugRouter } from "./routers/debug-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  resume: resumeRouter,
  interview: interviewRouter,
  persona: personaRouter,
  settings: settingsRouter,
  job: jobRouter,
  skill: skillRouter,
  system: systemSettingsRouter,
  admin: adminRouter,
  payment: paymentRouter,
  scraper: scraperRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
