import type { GalleryItem } from "./catalog";

export const PROOF_STEMS = [
  "01-bar-basic",
  "02-line-multi",
  "81-sankey-airport-ground",
] as const;

export type ProofStem = (typeof PROOF_STEMS)[number];

export type ProofView = {
  stem: ProofStem;
  type: "bar" | "line" | "sankey";
  title: string;
  fence: string;
  src: string;
};

export function proofViews(
  items: GalleryItem[],
  urlsByStem: Record<ProofStem, string>,
): ProofView[] {
  return PROOF_STEMS.map((stem) => {
    const item = items.find((entry) => entry.id === stem);
    if (!item) {
      throw new Error(`missing proof gallery item: ${stem}`);
    }
    const src = urlsByStem[stem];
    if (!src) {
      throw new Error(`missing proof svg url: ${stem}`);
    }
    const type = item.type;
    if (type !== "bar" && type !== "line" && type !== "sankey") {
      throw new Error(`unexpected proof type for ${stem}: ${type}`);
    }
    return {
      stem,
      type,
      title: item.title,
      fence: item.fence,
      src,
    };
  });
}
