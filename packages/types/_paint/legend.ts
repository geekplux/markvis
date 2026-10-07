import { LEGEND } from "./tokens.js";
import { attrs, fmtPx } from "./xml.js";

/** Legend key in the theme's swatch shape. `top` is the top edge of a 10px box. */
export function legendSwatch(
  x: number,
  top: number,
  color: string,
  opacity?: number,
): string {
  const fillOpacity = opacity === undefined || opacity === 1 ? undefined : opacity;
  if (LEGEND.swatch === "circle") {
    return `<circle ${attrs({
      cx: fmtPx(x + 5),
      cy: fmtPx(top + 5),
      r: 5,
      fill: color,
      "fill-opacity": fillOpacity,
    })}/>`;
  }
  if (LEGEND.swatch === "line") {
    return `<rect ${attrs({
      x: fmtPx(x),
      y: fmtPx(top + 3.5),
      width: 10,
      height: 3,
      fill: color,
      "fill-opacity": fillOpacity,
      rx: 1.5,
    })}/>`;
  }
  return `<rect ${attrs({
    x: fmtPx(x),
    y: fmtPx(top),
    width: 10,
    height: 10,
    fill: color,
    "fill-opacity": fillOpacity,
    rx: LEGEND.swatch === "rounded" ? 3 : 1,
  })}/>`;
}
