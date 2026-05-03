import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";

export const settingsRouter = createRouter({
  // Get user settings (stored in localStorage on frontend)
  get: authedQuery.query(async () => {
    return null;
  }),

  // Update user settings
  update: authedQuery
    .input(z.object({ preferences: z.record(z.string(), z.any()).optional() }))
    .mutation(async () => {
      return { success: true };
    }),

  // Set API Key (admin only - moved to system router)
  setApiKey: authedQuery
    .input(z.object({ apiKey: z.string().min(10) }))
    .mutation(async () => {
      return { success: true };
    }),

  clearApiKey: authedQuery.mutation(async () => {
    return { success: true };
  }),
});
