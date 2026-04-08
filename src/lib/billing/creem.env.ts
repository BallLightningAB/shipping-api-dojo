import { z } from "zod";

const creemEnvSchema = z.object({
	CREEM_API_KEY: z.string().min(1),
	CREEM_PRO_ANNUAL_PRODUCT_ID: z.string().min(1),
	CREEM_PRO_MONTHLY_PRODUCT_ID: z.string().min(1),
	CREEM_WEBHOOK_SECRET: z.string().min(1),
	CREEM_ENTERPRISE_PRODUCT_ID: z.string().optional(),
});

export type CreemEnv = z.infer<typeof creemEnvSchema>;

export function getCreemEnv(env: NodeJS.ProcessEnv = process.env): CreemEnv {
	return creemEnvSchema.parse(env);
}
