import "dotenv/config";
import fs from "fs";
import * as YAML from "yaml";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Logger } from "../logger.js";

const logger = Logger.getInstance();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NODE_ENV = process.env.NODE_ENV || "dev";
const configPath = path.resolve(
  __dirname,
  "../../../../config",
  `${NODE_ENV}.yaml`
);

let envConfig: any;

try {
  const file = fs.readFileSync(configPath, "utf8");
  logger.info("Environment: ", NODE_ENV);

  // Replace ${VAR} with process.env.VAR
  const interpolated = file.replace(/\$\{(.*?)\}/g, (_, name) => {
    const value = process.env[name];
    logger.info("Interpolating env name: ", name);
    logger.info("Interpolating env variable: ", value);
    if (!value) {
      console.warn(`⚠️ Environment variable ${name} is not defined`);
    }
    return value || "";
  });

  envConfig = YAML.parse(interpolated);
} catch (err) {
  console.error(
    `❌ Could not load config for environment '${NODE_ENV}' from ${configPath}`
  );
  process.exit(1);
}

export default envConfig;
