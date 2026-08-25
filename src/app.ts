import express from "express";

import userRoutes from "./routes/user.routes";
import articleRoutes from "./routes/article.routes";

const app = express();

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", articleRoutes);

export default app;
