import { z } from "zod";

/**
 * Validates env at boot so missing production variables fail fast with a clear message.
 * Keep keys in sync with `.env.example` when you add new configuration.
 */
const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    DATABASE_URL: z.string().min(1, "required"),
    CLERK_PUBLISHABLE_KEY: z.string().min(1, "required"),
    CLERK_SECRET_KEY: z.string().min(1, "required"),
    CLOUDINARY_URL: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
    CLERK_AUTHORIZED_PARTIES: z.string().optional(),
    PORT: z.string().optional(),
    VERCEL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const url = data.CLOUDINARY_URL?.trim();
    const triple =
      Boolean(data.CLOUDINARY_CLOUD_NAME?.trim()) &&
      Boolean(data.CLOUDINARY_API_KEY?.trim()) &&
      Boolean(data.CLOUDINARY_API_SECRET?.trim());
    if (!url && !triple) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET",
        path: ["CLOUDINARY_URL"],
      });
    }

    const placeholderHint =
      "Replace template text with values from Cloudinary Console → Dashboard (or Settings → API Keys).";
    if (
      url &&
      (/<your_|your_api_key|your_api_secret/i.test(url) ||
        (url.includes("<") && url.includes(">")))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `CLOUDINARY_URL still looks like a doc example (${placeholderHint})`,
        path: ["CLOUDINARY_URL"],
      });
    }
    const apiKey = data.CLOUDINARY_API_KEY?.trim();
    const apiSecret = data.CLOUDINARY_API_SECRET?.trim();
    if (apiKey && /<your_|your_api_key/i.test(apiKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `CLOUDINARY_API_KEY is a placeholder (${placeholderHint})`,
        path: ["CLOUDINARY_API_KEY"],
      });
    }
    if (apiSecret && /<your_|your_api_secret/i.test(apiSecret)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `CLOUDINARY_API_SECRET is a placeholder (${placeholderHint})`,
        path: ["CLOUDINARY_API_SECRET"],
      });
    }
  });

export type ValidatedEnv = z.infer<typeof envSchema>;

export function validateEnv(
  config: Record<string, unknown>
): Record<string, unknown> {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`
    );
    throw new Error(
      `Invalid environment:\n${lines.join("\n")}\n\nCopy apps/api/.env.example → apps/api/.env and fill values; mirror keys in Vercel → Project → Settings → Environment Variables.`
    );
  }
  return config;
}
