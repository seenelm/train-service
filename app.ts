import express from "express";
import envConfig from "./src/common/config/envConfig.js";
import MongoDB from "./src/infrastructure/database/db.js";
import routes from "./src/routes/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Hello, world!"));

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

export default app;
