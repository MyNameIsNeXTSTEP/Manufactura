import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { getServiceHealth } from "@manufactura/application";
import { createSupabaseAdminClient, prisma } from "@manufactura/infrastructure";
import { appEnv, assertRequiredEnv } from "@manufactura/shared";

async function buildServer() {
  assertRequiredEnv();

  const app = Fastify({
    logger: true
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Manufactura API",
        version: "3.0.0"
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  app.get("/health", async () => {
    return getServiceHealth("api");
  });

  app.get("/health/db", async () => {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  });

  app.get("/health/supabase", async () => {
    createSupabaseAdminClient();

    return {
      status: "ok",
      message: "Supabase client initialized"
    };
  });

  return app;
}

async function start() {
  const app = await buildServer();
  await app.listen({ port: appEnv.apiPort, host: "0.0.0.0" });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
