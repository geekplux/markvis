import { markdownItMarkvis } from "markvis/markdown-it";

type MarkdownItLike = Parameters<typeof markdownItMarkvis>[0];

export function activate(): {
  extendMarkdownIt: <T extends MarkdownItLike>(md: T) => T;
} {
  return {
    extendMarkdownIt<T extends MarkdownItLike>(md: T): T {
      markdownItMarkvis(md);
      return md;
    },
  };
}

export function deactivate(): void {}
