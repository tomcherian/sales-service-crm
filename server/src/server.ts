import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

try {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.info(`API listening on http://localhost:${env.PORT}`);
  });
} catch (error) {
  console.error("Failed to start server", error);
  process.exitCode = 1;
}
