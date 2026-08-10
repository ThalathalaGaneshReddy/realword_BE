import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello TypeScript!");
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
