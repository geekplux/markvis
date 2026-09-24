import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "@markvis/ir";
import {
  typeRegistry,
  resolveTypePack,
  bar,
  line,
  area,
  scatter,
  pie,
  hist,
} from "../registry.js";
import { typeExtras } from "../fence-keys.js";

describe("type registry", () => {
  it("registers exactly the closed CHART_TYPES set", () => {
    expect(Object.keys(typeRegistry).sort()).toEqual([...CHART_TYPES].sort());
  });

  it("each pack.id matches registry key", () => {
    expect(typeRegistry.bar).toBe(bar);
    expect(typeRegistry.line).toBe(line);
    expect(typeRegistry.area).toBe(area);
    expect(typeRegistry.scatter).toBe(scatter);
    expect(typeRegistry.pie).toBe(pie);
    expect(typeRegistry.hist).toBe(hist);
    for (const id of CHART_TYPES) {
      expect(typeRegistry[id].id).toBe(id);
      expect(typeRegistry[id].extras).toEqual(typeExtras[id]);
      expect([...typeRegistry[id].extras]).toEqual([]);
      expect(resolveTypePack(id)).toBe(typeRegistry[id]);
    }
  });

  it("fails loudly when a pack is missing", () => {
    expect(() => resolveTypePack("not-a-type")).toThrow(/E_MISSING_TYPE_PACK/);
    expect(() => resolveTypePack("")).toThrow(/E_MISSING_TYPE_PACK/);
    expect(() => resolveTypePack("donut")).toThrow(/E_MISSING_TYPE_PACK/);
  });
});
