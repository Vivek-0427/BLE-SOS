//index
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// routes
import authRoutes from "./src/routes/auth.routes.js";
import sosRoutes from "./src/routes/sos.routes.js";
import relayRoutes from "./src/routes/relay.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";

// middleware
import { errorHandler } from "./src/middleware/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, slow down." },
});
app.use(limiter);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "SOS Relay Backend is running." });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/relay", relayRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
