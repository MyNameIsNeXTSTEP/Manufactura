import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(currentDir, "../../../.env");
config({ path: rootEnvPath });

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.healthcheck.upsert({
    where: { id: "baseline-healthcheck-seed" },
    update: {
      message: "seed updated"
    },
    create: {
      id: "baseline-healthcheck-seed",
      message: "seed created"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
