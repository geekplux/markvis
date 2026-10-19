/**
 * Build-time data for the home page's type grid (TypeGrid.vue): read in
 * Node by VitePress, so the browser gets the cards as plain data.
 */
import { defineLoader } from "vitepress";
import { type TypeCard, typeCards } from "./type-pages";

export type { TypeCard };

declare const data: TypeCard[];
export { data };

export default defineLoader({
  load(): TypeCard[] {
    return typeCards();
  },
});
