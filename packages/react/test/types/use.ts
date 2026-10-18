// Compiled by types.test.ts against the published declarations.
import { createElement } from "react";
import Markdown from "react-markdown";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "../../../../scripts/dts/react.js";

createElement(Markvis, { source: "x", width: 300, theme: "folio", onError: (e) => e.code });
createElement(Markvis, { source: "x", className: undefined, width: undefined });
createElement(Markvis, { chart: { type: "bar", x: "a", y: "b", innerRadius: 0.5 }, data: [{ a: 1 }] });
createElement(Markdown, { components: markvisComponents, remarkPlugins: [remarkMarkvisStreaming], children: "" });
createElement(Markdown, { components: { ...markvisComponents, p: () => null }, children: "" });
// @ts-expect-error source and chart are exclusive
createElement(Markvis, { source: "x", chart: { type: "bar" }, data: [] });
// @ts-expect-error unknown theme
createElement(Markvis, { source: "x", theme: "neon" });
