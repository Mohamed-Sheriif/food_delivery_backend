import "reflect-metadata";
import http from "http";
import { createApp } from "./app";
import { env } from "./lib/config/env";
import { db } from "./lib/knex/knex";
import { container } from "./lib/di/container";
import { TOKENS } from "./lib/di/tokens";
import type { Logger } from "./lib/logger/logger";

const app = createApp();
const server = http.createServer(app);

server.listen(env.port, () => {
  container.resolve<Logger>(TOKENS.Logger).info(`Server listening on ${env.port}`);
});

async function shutdown() {
  server.close(async () => {
    console.log("Database shutdown");
    await db.destroy();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
