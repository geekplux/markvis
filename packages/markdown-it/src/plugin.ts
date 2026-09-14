import { extractCharts } from "@markvis/parser";
import { chartBlockHtml } from "./html.js";

const LANGS = new Set(["chart", "markvis", "vis"]);

type Token = {
  type: string;
  tag: string;
  content: string;
  info: string;
  map: [number, number] | null;
  block: boolean;
  nesting: number;
  markup: string;
};

type StateCore = {
  src: string;
  tokens: Token[];
  Token: new (type: string, tag: string, nesting: number) => Token;
};

type MarkdownItLike = {
  core: {
    ruler: {
      after: (
        beforeName: string,
        ruleName: string,
        fn: (state: StateCore) => void,
      ) => void;
    };
  };
  renderer: {
    rules: {
      fence?: (
        tokens: Token[],
        idx: number,
        options: unknown,
        env: unknown,
        slf: { renderToken: (tokens: Token[], idx: number, options: unknown) => string },
      ) => string;
    };
  };
};

function lineAt(src: string, offset: number): number {
  let line = 0;
  const end = Math.min(Math.max(offset, 0), src.length);
  for (let i = 0; i < end; i++) {
    if (src.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

function fenceLang(info: string): string {
  return info.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
}

function replaceCharts(state: StateCore): void {
  const src = state.src;
  const charts = extractCharts(src);
  if (charts.length === 0) {
    return;
  }

  for (let c = charts.length - 1; c >= 0; c--) {
    const chart = charts[c]!;
    const start = chart.index;
    const end = chart.index + chart.raw.length;
    const startLine = lineAt(src, start);
    const lastLine = lineAt(src, Math.max(start, end - 1));
    const tokens = state.tokens;
    let from = -1;
    let to = -1;
    for (let i = 0; i < tokens.length; i++) {
      const map = tokens[i]!.map;
      if (!map) {
        continue;
      }
      const line = map[0];
      if (line >= startLine && line <= lastLine) {
        if (from === -1) {
          from = i;
        }
        to = i;
      }
    }
    if (from === -1 || to === -1) {
      continue;
    }
    const token = new state.Token("html_block", "", 0);
    token.content = `${chartBlockHtml(chart.raw)}\n`;
    token.map = [startLine, lastLine + 1];
    token.block = true;
    tokens.splice(from, to - from + 1, token);
  }
}

export function markdownItMarkvis(md: MarkdownItLike): void {
  md.core.ruler.after("block", "markvis_charts", replaceCharts);

  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]!;
    const lang = fenceLang(token.info);
    if (LANGS.has(lang)) {
      const body = token.content;
      const raw = `\`\`\`${lang}\n${body}\`\`\``;
      return `${chartBlockHtml(raw)}\n`;
    }
    if (defaultFence) {
      return defaultFence(tokens, idx, options, env, slf);
    }
    return slf.renderToken(tokens, idx, options);
  };
}
