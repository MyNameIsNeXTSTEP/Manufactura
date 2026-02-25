import { createSupabaseAdminClient, prisma } from "@manufactura/infrastructure";
import { appEnv, assertRequiredEnv } from "@manufactura/shared";

assertRequiredEnv();

async function runWorkerTick(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  createSupabaseAdminClient();
  // eslint-disable-next-line no-console
  console.log(`[worker] tick @ ${new Date().toISOString()}`);
}

async function bootstrap(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[worker] started on port hint ${appEnv.workerPort}`);
  await runWorkerTick();
  setInterval(() => {
    void runWorkerTick();
  }, 60_000);
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
