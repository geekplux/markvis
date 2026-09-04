import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "./index.js";
import {
  MARKVIS_2_SCHEMA_RELATIVE_PATH,
  checkCommittedSchema,
  generateChartIRJsonSchema,
  serializeChartIRJsonSchema,
  writeCommittedSchema,
} from "./json-schema.js";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

describe("schema/markvis-2.schema.json", () => {
  it("matches live ChartIRSchema (zod is SoT; fail on hand-edit drift)", () => {
    const result = checkCommittedSchema(repoRoot);
    expect(result.ok, result.message).toBe(true);
    expect(
      readFileSync(join(repoRoot, MARKVIS_2_SCHEMA_RELATIVE_PATH), "utf8"),
    ).toBe(serializeChartIRJsonSchema());
  });

  it("fails when a committed schema is tampered", () => {
    const dir = mkdtempSync(join(tmpdir(), "markvis-schema-"));
    writeCommittedSchema(dir);
    const path = join(dir, MARKVIS_2_SCHEMA_RELATIVE_PATH);
    writeFileSync(
      path,
      readFileSync(path, "utf8").replaceAll('"bar"', '"barX"'),
      "utf8",
    );
    const result = checkCommittedSchema(dir);
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/drifted from ChartIRSchema/);
  });

  it("describes the frozen six chart types and forbids extra fields", () => {
    const schema = generateChartIRJsonSchema();
    const json = JSON.stringify(schema);
    for (const type of CHART_TYPES) {
      expect(json).toContain(`"${type}"`);
    }
    expect(json).not.toContain("donut");
    expect(json).not.toContain("heatmap");
    expect(schema.$id).toBe(
      "https://github.com/geekplux/markvis/schema/markvis-2.schema.json",
    );
    expect(schema.title).toBe("markvis Chart IR");
    expect(schema.additionalProperties).toBe(false);
    const table = schema.properties as Record<string, JsonSchemaLike>;
    expect(table.table?.additionalProperties).toBe(false);
  });
});

type JsonSchemaLike = { additionalProperties?: boolean };
