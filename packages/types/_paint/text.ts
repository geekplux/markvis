/**
 * Deterministic width estimate. Latin and similar scripts use 0.62em.
 * CJK and related wide scripts (code point above U+2E80) use 1em.
 * This is not an operating-system font measurement. The theme FONT stack
 * is the typeface the estimate stands in for.
 */
/**
 * Estimated advance width. Semibold and heavier faces run about 8% wider,
 * so pass the weight wherever a bold label must fit a measured gutter.
 */
export function textWidth(text: string, fontSize: number, weight = 400): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const em = code > 0x2e80 ? 1 : 0.62;
    width += fontSize * em;
  }
  return weight >= 600 ? width * 1.08 : width;
}

export function truncateLabel(
  text: string,
  maxPx: number,
  fontSize: number,
  weight = 400,
): string {
  if (textWidth(text, fontSize, weight) <= maxPx) {
    return text;
  }
  let out = text;
  while (out.length > 0 && textWidth(`${out}…`, fontSize, weight) > maxPx) {
    out = out.slice(0, -1);
  }
  const trimmed = out.trimEnd();
  return trimmed.length === 0 ? "…" : `${trimmed}…`;
}

/** Half a pixel covers estimator noise when a reserved margin is recomputed. */
const FIT_SLOP = 0.5;

/**
 * Keep one line inside the frame. Shift the anchor before truncating.
 * A label that already fits centered is returned unchanged.
 */
export function placeHorizontalLabel(
  x: number,
  text: string,
  fontSize: number,
  frameWidth: number,
  pad = 8,
): { x: number; anchor: "start" | "middle" | "end"; text: string } {
  const width = textWidth(text, fontSize);
  const rightEdge = frameWidth - pad;
  if (!(width <= rightEdge - pad + FIT_SLOP)) {
    return {
      x: pad,
      anchor: "start",
      text: truncateLabel(text, Math.max(0, rightEdge - pad), fontSize),
    };
  }
  if (x - width / 2 >= pad - FIT_SLOP && x + width / 2 <= rightEdge + FIT_SLOP) {
    return { x, anchor: "middle", text };
  }
  if (x + width / 2 > rightEdge && x - width >= pad - FIT_SLOP) {
    return { x: Math.min(x, rightEdge), anchor: "end", text };
  }
  if (x - width / 2 < pad && x + width <= rightEdge + FIT_SLOP) {
    return { x: Math.max(x, pad), anchor: "start", text };
  }
  if (x + width / 2 > rightEdge) {
    return { x: rightEdge, anchor: "end", text };
  }
  return { x: pad, anchor: "start", text };
}

export type WrappedText = {
  lines: string[];
  truncated: boolean;
};

/** Greedy word wrap. A token wider than the line is split by character. */
export function wrapText(
  text: string,
  fontSize: number,
  maxWidth: number,
  maxLines = 4,
  weight = 400,
): WrappedText {
  const limit = Math.max(1, maxLines);
  if (text.length === 0) {
    return { lines: [""], truncated: false };
  }
  if (!(maxWidth > 0) || textWidth(text, fontSize, weight) <= maxWidth) {
    return { lines: [text], truncated: false };
  }

  const words: string[] = [];
  let cut = false;
  for (const part of text.split(/\s+/)) {
    if (part === "") {
      continue;
    }
    if (textWidth(part, fontSize, weight) <= maxWidth) {
      words.push(part);
      continue;
    }
    // A long Latin word keeps its letters together and ends in "…"; text
    // without spaces (CJK) can only wrap between characters.
    if (![...part].some((char) => (char.codePointAt(0) ?? 0) > 0x2e80)) {
      words.push(truncateLabel(part, maxWidth, fontSize, weight));
      cut = true;
      continue;
    }
    let chunk = "";
    for (const char of part) {
      const next = chunk + char;
      if (chunk !== "" && textWidth(next, fontSize, weight) > maxWidth) {
        words.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    if (chunk !== "") {
      words.push(chunk);
    }
  }

  const lines: string[] = [];
  let current = "";
  let i = 0;
  while (i < words.length) {
    const word = words[i]!;
    const candidate = current === "" ? word : `${current} ${word}`;
    if (textWidth(candidate, fontSize, weight) <= maxWidth) {
      current = candidate;
      i += 1;
      continue;
    }
    if (lines.length === limit - 1) {
      break;
    }
    if (current !== "") {
      lines.push(current);
      current = "";
      continue;
    }
    lines.push(word);
    i += 1;
    current = "";
  }

  if (i >= words.length) {
    if (current !== "") {
      lines.push(current);
    }
    return {
      lines: lines.length > 0 ? lines : [text],
      truncated: cut,
    };
  }

  const rest = [current, ...words.slice(i)].filter((part) => part !== "").join(" ");
  const last = truncateLabel(rest, maxWidth, fontSize, weight);
  lines.push(last);
  return { lines: lines.slice(0, limit), truncated: last !== rest };
}
