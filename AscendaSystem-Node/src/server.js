import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { dataAdapter } from "./data/index.js";
import { securityHeaders } from "./middleware/security.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { mentorsRouter } from "./routes/mentors.js";
import { internsRouter } from "./routes/interns.js";
import { entitiesRouter } from "./routes/entities.js";
import { aiRouter } from "./routes/ai.js";

const app = express();
const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 80, label: "auth" });
const aiLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 30, label: "ai" });

app.use(securityHeaders);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }

      if (env.corsOrigin.length === 0 && env.nodeEnv !== "production") {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: env.jsonBodyLimit }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/me", meRouter);
app.use("/api/mentors", mentorsRouter);
app.use("/api/interns", internsRouter);
app.use("/api/entities", entitiesRouter);
app.use("/api/ai", aiLimiter, aiRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

app.use((error, req, res, _next) => {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message: error.message || "Internal server error",
      details: env.exposeErrorDetails ? error.details : undefined,
      requestId: req.requestId,
    },
  });
});

app.listen(env.port, () => {
  console.log(`Ascenda backend listening on http://localhost:${env.port}`);
  console.log(`Data provider: ${dataAdapter.provider}`);
});
