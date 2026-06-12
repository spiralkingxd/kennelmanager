import { z } from 'zod';

// Config keys live in the URL (req.params.key), so the body only carries
// the value/description. The controller uses `updateSystemConfigSchema`
// via an upsert pattern.
export const updateSystemConfigSchema = z.object({
  value: z.unknown(),
  description: z.string().optional(),
});
