import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { ZodTypeAny } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChartIRSchema } from "./index.js";

export const MARKVIS_2_SCHEMA_ID =
  "https://github.com/geekplux/markvis/schema/markvis-2.schema.json";

export const MARKVIS_2_SCHEMA_RELATIVE_PATH = "schema/markvis-2.schema.json";

export type JsonSchema = Record<string, unknown>;

const ZOD_TO_JSON_SCHEMA_OPTIONS = {
  $refStrategy: "none" as const,
  target: "jsonSchema7" as const,
};

export function jsonSchemaFromZod(schema: ZodTypeAny): JsonSchema {
  return zodToJsonSchema(schema, ZOD_TO_JSON_SCHEMA_OPTIONS) as JsonSchema;
}

export function markvis2SchemaFromZod(
  schema: ZodTypeAny = ChartIRSchema,
): JsonSchema {
  const generated = jsonSchemaFromZod(schema);
  const {
    $schema,
    $id: _id,
    title: _title,
    description: _description,
    ...rest
  } = generated;
  return {
    $schema:
      typeof $schema === "string"
        ? $schema
        : "http://json-schema.org/draft-07/schema#",
    $id: MARKVIS_2_SCHEMA_ID,
    title: "markvis Chart IR",
    description:
      "Generated from @markvis/ir ChartIRSchema. Do not hand-edit; run pnpm schema:generate.",
    ...rest,
  };
}

export function generateChartIRJsonSchema(): JsonSchema {
  return markvis2SchemaFromZod(ChartIRSchema);
}

export function serializeJsonSchema(schema: JsonSchema): string {
  return `${JSON.stringify(schema, null, 2)}\n`;
}

export function serializeChartIRJsonSchema(): string {
  return serializeJsonSchema(generateChartIRJsonSchema());
}

export function writeCommittedSchema(
  repoRoot: string,
  contents: string = serializeChartIRJsonSchema(),
): string {
  const outPath = join(repoRoot, MARKVIS_2_SCHEMA_RELATIVE_PATH);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, contents, "utf8");
  return outPath;
}

export function checkCommittedSchema(
  repoRoot: string,
  expected: string = serializeChartIRJsonSchema(),
): { ok: boolean; message: string } {
  const path = join(repoRoot, MARKVIS_2_SCHEMA_RELATIVE_PATH);
  if (!existsSync(path)) {
    return {
      ok: false,
      message: `${MARKVIS_2_SCHEMA_RELATIVE_PATH} is missing; run pnpm schema:generate`,
    };
  }
  const actual = readFileSync(path, "utf8");
  if (actual !== expected) {
    return {
      ok: false,
      message: `${MARKVIS_2_SCHEMA_RELATIVE_PATH} drifted from ChartIRSchema; run pnpm schema:generate`,
    };
  }
  return { ok: true, message: "ok" };
}
