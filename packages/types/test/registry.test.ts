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
  heatmap,
  funnel,
  waterfall,
  radar,
  gauge,
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
    expect(typeRegistry.heatmap).toBe(heatmap);
    expect(typeRegistry.funnel).toBe(funnel);
    expect(typeRegistry.waterfall).toBe(waterfall);
    expect(typeRegistry.radar).toBe(radar);
    expect(typeRegistry.gauge).toBe(gauge);
    for (const id of CHART_TYPES) {
      expect(typeRegistry[id].id).toBe(id);
      expect(typeRegistry[id].extras).toEqual(typeExtras[id]);
      expect([...typeRegistry[id].extras]).toEqual([...typeExtras[id]]);
      expect(resolveTypePack(id)).toBe(typeRegistry[id]);
    }
  });

  it("locks Wave 1 typeExtras", () => {
    expect([...typeExtras.bar]).toEqual(["layout"]);
    expect([...typeExtras.line]).toEqual(["layout"]);
    expect([...typeExtras.area]).toEqual(["layout"]);
    expect([...typeExtras.pie]).toEqual(["innerRadius"]);
    expect([...typeExtras.scatter]).toEqual([]);
    expect([...typeExtras.hist]).toEqual([]);
  });

  it("locks Wave 2 typeExtras", () => {
    expect([...typeExtras.heatmap]).toEqual([]);
    expect([...typeExtras.funnel]).toEqual([]);
    expect([...typeExtras.waterfall]).toEqual([]);
    expect([...typeExtras.radar]).toEqual([]);
    expect([...typeExtras.gauge]).toEqual(["min", "max"]);
  });

  it("fails loudly when a pack is missing", () => {
    expect(() => resolveTypePack("not-a-type")).toThrow(/E_MISSING_TYPE_PACK/);
    expect(() => resolveTypePack("")).toThrow(/E_MISSING_TYPE_PACK/);
    expect(() => resolveTypePack("donut")).toThrow(/E_MISSING_TYPE_PACK/);
  });
});
