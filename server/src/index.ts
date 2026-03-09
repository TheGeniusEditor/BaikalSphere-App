import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "./config.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import modulesRouter from "./routes/modules.js";
import permissionsRouter from "./routes/permissions.js";
import internalRouter from "./routes/internal.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Allow *.baikalsphere.com subdomains in production
      const isBaikalsphereOrigin = /^https:\/\/[a-z0-9-]+\.baikalsphere\.com$/i.test(origin);
      const isLocalDev = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (config.nodeEnv !== "production" && isLocalDev) return callback(null, true);
      if (isBaikalsphereOrigin) return callback(null, true);
      if (config.corsOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("combined"));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/internal", internalRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Baikalsphere Auth API listening on port ${config.port}`);
});
