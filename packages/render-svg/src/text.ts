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
  return `${out}…`;
}
