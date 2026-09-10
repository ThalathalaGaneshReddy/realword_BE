import express from "express";

import userRoutes from "./routes/user.routes";
import articleRoutes from "./routes/article.routes";
import commentRoutes from "./routes/comment.routes";
import profileRoutes from "./routes/profile.routes";
import tagRoutes from "./routes/tag.routes";
const app = express();

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", articleRoutes);
app.use("/api", commentRoutes);
app.use("/api", profileRoutes);
app.use("/api", tagRoutes);
export default app;
