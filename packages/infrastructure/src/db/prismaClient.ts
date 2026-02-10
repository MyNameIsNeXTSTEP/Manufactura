import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __manufacturaPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__manufacturaPrisma__ ??
  new PrismaClient({
    log: ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__manufacturaPrisma__ = prisma;
}
