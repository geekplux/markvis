import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MARKVIS_2_SCHEMA_RELATIVE_PATH,
  writeCommittedSchema,
} from "../src/json-schema.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
writeCommittedSchema(repoRoot);
process.stdout.write(`wrote ${MARKVIS_2_SCHEMA_RELATIVE_PATH}\n`);
