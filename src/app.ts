import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

import { env } from "./lib/config/env";
import { routes } from "./routes";
import { correlationId } from "./lib/correlation/correlationId";
import { createErrorHandler } from "./lib/error/errorHandler";
import { container } from "./lib/di/container";
import { TOKENS } from "./lib/di/tokens";
import type { Logger } from "./lib/logger/logger";

// localhost:3000/api/
export function createApp() {
  const app = express();

  // middlewares
  app.use(
    cors({
      origin: env.cors.origins,
      credentials: true,
    }),
  );
  app.use(helmet());
  app.set("query parser", "extended");
  app.use(express.json());
  app.use(cookieParser());
  app.use(correlationId);

  // routes
  app.use("/api", routes);

  // error handler
  app.use(createErrorHandler(container.resolve<Logger>(TOKENS.Logger)));
  return app;
}
