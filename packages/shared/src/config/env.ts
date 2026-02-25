import { fileURLToPath } from "node:url";
import { config } from "dotenv";

config({ path: fileURLToPath(new URL("../../../../.env", import.meta.url)) });

export const appEnv = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  apiPort: Number(process.env.API_PORT ?? 3001),
  workerPort: Number(process.env.WORKER_PORT ?? 3002),
  supabasePublicUrl: process.env.SUPABASE_PUBLIC_URL ?? "",
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
  supabaseProjectId: process.env.SUPABASE_PROJECT_ID ?? "",
  supabaseTxPoolUrl: process.env.SUPABASE_DATABASE_TRANSACTION_POOL_URL ?? "",
  supabaseDirectUrl: process.env.SUPABASE_DIRECT_URL ?? ""
} as const;

export function assertRequiredEnv(): void {
  const required: Array<keyof typeof appEnv> = [
    "supabasePublicUrl",
    "supabaseSecretKey",
    "supabaseTxPoolUrl"
  ];

  for (const key of required) {
    if (!appEnv[key]) {
      throw new Error(`Missing required env variable for ${key}`);
    }
  }
}
