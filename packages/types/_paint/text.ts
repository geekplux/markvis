/**
 * Deterministic width estimate. Latin and similar scripts use 0.62em.
 * CJK and related wide scripts (code point above U+2E80) use 1em.
 * This is not an operating-system font measurement. The theme FONT stack
 * is the typeface the estimate stands in for.
 */
export function textWidth(text: string, fontSize: number): number {
  let width = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const em = code > 0x2e80 ? 1 : 0.62;
    width += fontSize * em;
  }
  return width;
}

export function truncateLabel(
  text: string,
  maxPx: number,
  fontSize: number,
): string {
  if (textWidth(text, fontSize) <= maxPx) {
    return text;
  }
  let out = text;
  while (out.length > 0 && textWidth(`${out}…`, fontSize) > maxPx) {
    out = out.slice(0, -1);
  }
  return out.length === 0 ? "…" : `${out}…`;
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
): WrappedText {
  const limit = Math.max(1, maxLines);
  if (text.length === 0) {
    return { lines: [""], truncated: false };
  }
  if (!(maxWidth > 0) || textWidth(text, fontSize) <= maxWidth) {
    return { lines: [text], truncated: false };
  }

  const words: string[] = [];
  for (const part of text.split(/\s+/)) {
    if (part === "") {
      continue;
    }
    if (textWidth(part, fontSize) <= maxWidth) {
      words.push(part);
      continue;
    }
    let chunk = "";
    for (const char of part) {
      const next = chunk + char;
      if (chunk !== "" && textWidth(next, fontSize) > maxWidth) {
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
    if (textWidth(candidate, fontSize) <= maxWidth) {
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
      truncated: false,
    };
  }

  const rest = [current, ...words.slice(i)].filter((part) => part !== "").join(" ");
  const last = truncateLabel(rest, maxWidth, fontSize);
  lines.push(last);
  return { lines: lines.slice(0, limit), truncated: last !== rest };
}
