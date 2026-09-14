import { markdownItMarkvis } from "../../../packages/markdown-it/src/plugin.ts";

type MarkdownItLike = Parameters<typeof markdownItMarkvis>[0];

export function activate(): {
  extendMarkdownIt: (md: MarkdownItLike) => MarkdownItLike;
} {
  return {
    extendMarkdownIt(md: MarkdownItLike) {
      markdownItMarkvis(md);
      return md;
    },
  };
}

export function deactivate(): void {}
