import express from "express";
import cookieParser from "cookie-parser";

import { routes } from "./routes";
import { correlationId } from "./lib/correlation/correlationId";
import { errorHandler } from "./lib/error/errorHandler";

// localhost:3000/api/
export function createApp() {
  const app = express();

  // middlewares
  app.use(express.json());
  app.use(cookieParser());
  app.use(correlationId);

  // routes
  app.use("/api", routes);

  // error handler
  app.use(errorHandler);
  return app;
}
