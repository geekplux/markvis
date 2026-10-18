/**
 * Golden comparator for rendered SVG. `stripVars` reduces an SVG to its
 * fixed-color form: `--markvis-*` variable declarations in a `style`
 * attribute are dropped (and the attribute with them once empty), and any
 * remaining `var(--markvis-name, fallback)` becomes its fallback. Today's
 * output carries no variables, so it returns its input unchanged; goldens
 * compare through it so a later change in how colors are written cannot hide
 * a change in geometry.
 */

/** A fallback may hold XML entities such as `&quot;`, whose `;` does not end the declaration. */
const VAR_DECL =
  /\s*[a-z-]+\s*:\s*var\(--markvis-[a-z0-9-]+\s*,\s*(?:&[a-z]+;|[^;)])*\)\s*;?/g;
const STYLE_ATTR = / style="([^"]*)"/g;
const VAR_REF = /var\(--markvis-[a-z0-9-]+\s*,\s*([^)]*?)\s*\)/g;

export function stripVars(svg: string): string {
  if (!svg.includes("var(--markvis-")) {
    return svg;
  }
  return svg
    .replace(STYLE_ATTR, (whole, body: string) => {
      if (!body.includes("var(--markvis-")) {
        return whole;
      }
      const rest = body
        .replace(VAR_DECL, "")
        .trim()
        .replace(/;\s*$/, "");
      return rest === "" ? "" : ` style="${rest}"`;
    })
    .replace(VAR_REF, "$1");
}
