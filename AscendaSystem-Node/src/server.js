import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";
import { entitiesRouter } from "./routes/entities.js";
import { aiRouter } from "./routes/ai.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin.length === 0 || env.corsOrigin.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.use("/api/health", healthRouter);
app.use("/api/me", meRouter);
app.use("/api/entities", entitiesRouter);
app.use("/api/ai", aiRouter);

app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message: error.message || "Internal server error",
      details: error.details,
    },
  });
});

app.listen(env.port, () => {
  console.log(`Ascenda backend listening on http://localhost:${env.port}`);
});
